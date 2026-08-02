import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Grade from "@/models/Grade";
import { getGradeForMarks } from "@/lib/gradeTable";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { marks } = body;

  if (marks !== null && (typeof marks !== "number" || marks < 0 || marks > 100)) {
    return NextResponse.json({ error: "marks must be a number 0-100, or null" }, { status: 400 });
  }

  await connectDB();
  const grade = await Grade.findById(id);
  if (!grade) return NextResponse.json({ error: "Grade entry not found" }, { status: 404 });
  if (grade.user.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const computed = marks === null ? null : getGradeForMarks(marks);

  grade.marks = marks;
  grade.gradePoint = computed ? computed.gradePoint : null;
  grade.letterGrade = computed ? computed.letterGrade : null;
  await grade.save();

  return NextResponse.json(grade);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const grade = await Grade.findById(id);
  if (!grade) return NextResponse.json({ error: "Grade entry not found" }, { status: 404 });
  if (grade.user.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Grade.findByIdAndDelete(id);
  return NextResponse.json({ deleted: true });
}