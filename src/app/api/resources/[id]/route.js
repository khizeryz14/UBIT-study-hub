import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!["published", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "status must be 'published' or 'rejected'" },
      { status: 400 }
    );
  }

  await connectDB();

  const resource = await Resource.findByIdAndUpdate(id, { status }, { new: true });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.fileKey) {
    try {
      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: resource.fileKey,
        })
      );
    } catch (err) {
      // Don't fail the whole request if B2 cleanup fails — the DB record
      // is already gone, which is the more important half. Log for
      // manual cleanup instead of blocking the moderator's action.
      console.error(`Failed to delete B2 object ${resource.fileKey}:`, err);
    }
  }

  return NextResponse.json({ deleted: true });
}