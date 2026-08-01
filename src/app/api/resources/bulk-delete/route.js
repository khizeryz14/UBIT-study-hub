import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { b2Client } from "@/lib/b2";
import Resource from "@/models/Resource";

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  await connectDB();
  const resources = await Resource.find({ _id: { $in: ids } });

  const isModOrAdmin = ["admin", "moderator"].includes(session.user.role);
  if (!isModOrAdmin) {
    const allOwnedByUser = resources.every((r) => r.uploadedBy.toString() === session.user.id);
    if (!allOwnedByUser || resources.length !== ids.length) {
      return NextResponse.json(
        { error: "You can only delete resources you posted" },
        { status: 403 }
      );
    }
  }

  const b2Deletions = resources
    .filter((r) => r.fileKey)
    .map((r) =>
      b2Client
        .send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: r.fileKey }))
        .catch((err) => console.error(`Failed to delete B2 object ${r.fileKey}:`, err))
    );

  await Promise.all(b2Deletions);
  await Resource.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({ deleted: resources.length });
}