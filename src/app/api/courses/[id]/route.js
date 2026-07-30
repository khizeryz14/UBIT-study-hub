import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { b2Client } from "@/lib/b2";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher";
import Resource from "@/models/Resource";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, semester, creditHours, curriculum } = body;

  await connectDB();

  const course = await Course.findByIdAndUpdate(
    id,
    { title, description, semester, creditHours, curriculum },
    { new: true, runValidators: true }
  );

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  await connectDB();

  const course = await Course.findById(id);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Find every resource tied to this course so we can clean up B2 objects
  // before wiping the DB records — order matters here, we need the fileKeys
  // before they're gone.
  const resources = await Resource.find({ course: id }, { fileKey: 1 });

  const b2Deletions = resources
    .filter((r) => r.fileKey)
    .map((r) =>
      b2Client
        .send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: r.fileKey }))
        .catch((err) => {
          // Same principle as single-resource delete: don't let a B2 failure
          // block the cascade — log it for manual follow-up instead.
          console.error(`Failed to delete B2 object ${r.fileKey}:`, err);
        })
    );

  await Promise.all(b2Deletions);

  await Promise.all([
    Resource.deleteMany({ course: id }),
    Teacher.deleteMany({ course: id }),
  ]);

  await Course.findByIdAndDelete(id);

  return NextResponse.json({
    deleted: true,
    resourcesDeleted: resources.length,
  });
}