import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const q = searchParams.get("q")?.trim();
  const curriculum = searchParams.get("curriculum");
  const semester = searchParams.get("semester");

  await connectDB();

  const filter = {};
  if (curriculum && ["CS", "BSCS"].includes(curriculum)) filter.curriculum = curriculum;
  if (semester) filter.semester = Number(semester);
  if (q) {
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { title: { $regex: q, $options: "i" } },
    ];
  }

  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .sort({ semester: 1, code: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ courses, total, page, limit });
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { code, title, curriculum, description, semester, creditHours } = body;

  if (!code || !title || !semester || !curriculum) {
    return NextResponse.json(
      { error: "code, title, curriculum and semester are required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 409 });
    }

    const course = await Course.create({ code, title, description, semester, creditHours, curriculum });
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error("Course creation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to create course" }, { status: 500 });
  }
}