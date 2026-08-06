import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import { getSignedThumbUrl } from "@/lib/b2"; // adjust to wherever your B2 signing helper actually lives
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const [, session] = await Promise.all([
    connectDB(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const isModOrAdmin = session && ["admin", "moderator"].includes(session.user.role);

  const filter = {};
  if (course) filter.course = course;
  if (teacher) filter.teacher = teacher;
  if (folder) filter.folder = folder;
  filter.status = statusParam && isModOrAdmin ? statusParam : "published";
  if (q) filter.$text = { $search: q };

  const [total, resources] = await Promise.all([
    Resource.countDocuments(filter),
    Resource.find(filter)
      .populate("course", "code title")
      .populate("teacher", "name")
      .populate("folder", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const uploaderIds = [...new Set(resources.map((r) => r.uploadedBy?.toString()).filter(Boolean))];

  const [uploaders, thumbEntries] = await Promise.all([
    uploaderIds.length > 0
      ? clientPromise.then((client) =>
          client
            .db()
            .collection("user")
            .find(
              { _id: { $in: uploaderIds.map((id) => new mongoose.Types.ObjectId(id)) } },
              { projection: { name: 1 } }
            )
            .toArray()
        )
      : Promise.resolve([]),
    Promise.all(
      resources
        .filter((r) => r.thumbKey)
        .map(async (r) => [r._id.toString(), await getSignedThumbUrl(r.thumbKey)])
    ),
  ]);

  const uploaderMap = Object.fromEntries(uploaders.map((u) => [u._id.toString(), u.name]));
  const thumbMap = Object.fromEntries(thumbEntries);

  const enriched = resources.map((r) => ({
    ...r,
    uploader: { name: uploaderMap[r.uploadedBy?.toString()] || "Unknown" },
    isOwn: session ? r.uploadedBy?.toString() === session.user.id : false,
    thumbUrl: thumbMap[r._id.toString()] || null,
  }));

  return NextResponse.json({ resources: enriched, total, page, limit });
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, course, teacher, folder, items } = body;

  if (!title || !course || !teacher || !folder || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "title, course, teacher, folder, and at least one item are required" },
      { status: 400 }
    );
  }
  if (items.length > 20) {
    return NextResponse.json({ error: "Max 20 files per submission" }, { status: 400 });
  }
  for (const item of items) {
    if (!item.fileType || !item.fileUrl) {
      return NextResponse.json({ error: "Each item requires fileType and fileUrl" }, { status: 400 });
    }
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
  const status = isModOrAdmin ? "published" : "pending";
  const groupTotal = items.length;
  const groupId = groupTotal > 1 ? new mongoose.Types.ObjectId() : null;

  const docs = items.map((item, index) => ({
    title: groupTotal > 1 ? `${title}-${index + 1}` : title,
    baseTitle: title,
    description: description || "",
    course, teacher, folder,
    fileType: item.fileType,
    fileUrl: item.fileUrl,
    fileKey: item.fileKey || null,
    thumbKey: item.thumbKey || null,
    fileSize: item.fileSize || null,
    width: item.width || null,
    height: item.height || null,
    duration: item.duration || null,
    groupId,
    groupIndex: index + 1,
    groupTotal,
    uploadedBy: session.user.id,
    status,
  }));

  const created = await Resource.insertMany(docs);
  return NextResponse.json({ resources: created, count: created.length }, { status: 201 });
}