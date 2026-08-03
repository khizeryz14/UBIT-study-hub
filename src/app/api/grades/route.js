import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import "@/models/Course";
import Grade from "@/models/Grade";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try{
    await connectDB();
    const grades = await Grade.find({ user: session.user.id })
      .populate("course", "code title creditHours semester curriculum")
      .sort({ semester: 1 });

    return NextResponse.json({ grades });
  }
  catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message,
        stack:
          process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { semester, courseIds } = body;

  if (!semester || !Array.isArray(courseIds) || courseIds.length === 0) {
    return NextResponse.json({ error: "semester and courseIds are required" }, { status: 400 });
  }

  await connectDB();

  // Skip courses the student already has tracked (no retakes) rather than
  // erroring the whole batch on one duplicate.
  const existing = await Grade.find({ user: session.user.id, course: { $in: courseIds } });
  const existingIds = new Set(existing.map((g) => g.course.toString()));
  const toCreate = courseIds.filter((id) => !existingIds.has(id));

  const docs = toCreate.map((courseId) => ({
    user: session.user.id,
    course: courseId,
    semester,
  }));

  const created = docs.length > 0 ? await Grade.insertMany(docs) : [];

  return NextResponse.json({ created: created.length, skipped: courseIds.length - toCreate.length });
}