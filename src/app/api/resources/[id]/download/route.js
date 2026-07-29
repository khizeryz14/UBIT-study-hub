import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import { b2Client } from "@/lib/b2";

export async function GET(request, { params }) {
  const { id } = await params;

  await connectDB();
  const resource = await Resource.findById(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.status !== "published") {
    const session = await auth.api.getSession({ headers: await headers() });
    const isModOrAdmin = session && ["admin", "moderator"].includes(session.user.role);
    if (!isModOrAdmin) {
      return NextResponse.json({ error: "Not available" }, { status: 403 });
    }
  }

  if (resource.fileType === "link") {
    return NextResponse.json({ url: resource.fileUrl });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: resource.fileKey,
  });

  const url = await getSignedUrl(b2Client, command, { expiresIn: 300 });
  return NextResponse.json({ url });
}