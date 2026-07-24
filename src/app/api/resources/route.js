import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher";
import Folder from "@/models/Folder";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const course = searchParams.get("course");
  const teacher = searchParams.get("teacher");
  const folder = searchParams.get("folder");
  const q = searchParams.get("q");
  const statusParam = searchParams.get("status");

  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  const isModOrAdmin = session && ["admin", "moderator"].includes(session.user.role);

  const filter = {};
  if (course) filter.course = course;
  if (teacher) filter.teacher = teacher;
  if (folder) filter.folder = folder;
  filter.status = statusParam && isModOrAdmin ? statusParam : "published";
  if (q) filter.$text = { $search: q };

  const resources = await Resource.find(filter)
    .populate("course", "code title")
    .populate("teacher", "name")
    .populate("folder", "name slug")
    .sort({ createdAt: -1 });

  return NextResponse.json(resources);
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, course, teacher, folder, fileType, fileUrl, fileKey } = body;

  if (!title || !course || !teacher || !folder || !fileType || !fileUrl) {
    return NextResponse.json(
      { error: "title, course, teacher, folder, fileType, and fileUrl are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const [courseExists, teacherExists, folderExists] = await Promise.all([
    Course.findById(course),
    Teacher.findById(teacher),
    Folder.findById(folder),
  ]);

  if (!courseExists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!teacherExists) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  if (!folderExists) return NextResponse.json({ error: "Folder not found" }, { status: 404 });

  const isModOrAdmin = ["admin", "moderator"].includes(session.user.role);

  const resource = await Resource.create({
    title,
    description: description || "",
    course,
    teacher,
    folder,
    fileType,
    fileUrl,
    fileKey: fileKey || null,
    uploadedBy: session.user.id,
    status: isModOrAdmin ? "published" : "pending",
  });

  return NextResponse.json(resource, { status: 201 });
}