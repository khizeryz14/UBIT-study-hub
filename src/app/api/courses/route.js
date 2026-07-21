import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  await connectDB();
  const courses = await Course.find().sort({ semester: 1, code: 1 });
  return NextResponse.json(courses);
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

  await connectDB();

  const existing = await Course.findOne({ code: code.toUpperCase() });
  if (existing) {
    return NextResponse.json({ error: "Course code already exists" }, { status: 409 });
  }

  const course = await Course.create({ code, title, description, semester, creditHours });
  return NextResponse.json(course, { status: 201 });
}