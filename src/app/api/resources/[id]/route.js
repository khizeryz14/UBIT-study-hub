import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { b2Client } from "@/lib/b2";
import Resource from "@/models/Resource";

export async function GET(request, { params }) {
  const { id } = await params;

  await connectDB();
  const resource = await Resource.findById(id)
    .populate("course", "code title")
    .populate("teacher", "name")
    .populate("folder", "name slug");

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.status !== "published") {
    const session = await auth.api.getSession({ headers: await headers() });
    const isModOrAdmin = session && ["admin", "moderator"].includes(session.user.role);
    const isOwner = session && resource.uploadedBy.toString() === session.user.id;
    if (!isModOrAdmin && !isOwner) {
      return NextResponse.json({ error: "Not available" }, { status: 403 });
    }
  }

  return NextResponse.json(resource);
}

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

  await connectDB();
  const resource = await Resource.findById(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const isModOrAdmin = ["admin", "moderator"].includes(session.user.role);
  const isOwner = resource.uploadedBy.toString() === session.user.id;

  if (!isModOrAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Resource.findByIdAndDelete(id);

  if (resource.fileKey) {
    try {
      await b2Client.send(
        new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: resource.fileKey })
      );
    } catch (err) {
      console.error(`Failed to delete B2 object ${resource.fileKey}:`, err);
    }
  }

  return NextResponse.json({ deleted: true });
}