import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import Course from "@/models/Course";

// GET /api/teachers?courseId=xxx — list teachers for a given course
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  await connectDB();
  const teachers = await Teacher.find({ course: courseId }).sort({ name: 1 });
  return NextResponse.json(teachers);
}

// POST /api/teachers — admin/mod only, adds a teacher under a course
export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden — admin or moderator only" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, course } = body;

  if (!name || !course) {
    return NextResponse.json(
      { error: "name and course are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const courseExists = await Course.findById(course);
  if (!courseExists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await Teacher.findOne({ course, name: name.trim() });
  if (existing) {
    return NextResponse.json(
      { error: "This teacher already exists for this course" },
      { status: 409 }
    );
  }

  const teacher = await Teacher.create({
    name: name.trim(),
    course,
    createdBy: session.user.id,
  });

  return NextResponse.json(teacher, { status: 201 });
}