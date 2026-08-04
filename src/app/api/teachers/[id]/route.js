import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { b2Client } from "@/lib/b2";
import Teacher from "@/models/Teacher";
import Resource from "@/models/Resource";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden — admin or moderator only" }, { status: 403 });
  }

  await connectDB();

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  // Same cascade principle as course delete: pull fileKeys before wiping
  // the DB records, clean up B2, then delete Resources, then the Teacher.
  const resources = await Resource.find({ teacher: id }, { fileKey: 1 });

  const b2Deletions = resources
    .filter((r) => r.fileKey)
    .map((r) =>
      b2Client
        .send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: r.fileKey }))
        .catch((err) => console.error(`Failed to delete B2 object ${r.fileKey}:`, err))
    );

  await Promise.all(b2Deletions);
  await Resource.deleteMany({ teacher: id });
  await Teacher.findByIdAndDelete(id);

  return NextResponse.json({
    deleted: true,
    resourcesDeleted: resources.length,
  });
}