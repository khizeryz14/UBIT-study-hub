import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { b2Client } from "@/lib/b2";

const ALLOWED_TYPES = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "video/mp4": "video",
};

const MAX_SIZE_BY_CATEGORY = {
  pdf: 500 * 1024 * 1024,      // 500 MB
  image: 20 * 1024 * 1024,    // 20 MB
  video: 500 * 1024 * 1024,   // 500 MB
};

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fileName, fileMimeType, fileSize } = body;

  if (!fileName || !fileMimeType || !fileSize) {
    return NextResponse.json(
      { error: "fileName, fileMimeType, and fileSize are required" },
      { status: 400 }
    );
  }

  const category = ALLOWED_TYPES[fileMimeType];
  if (!category) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxSize = MAX_SIZE_BY_CATEGORY[category];
  if (fileSize > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max size for ${category} is ${Math.round(maxSize / 1024 / 1024)}MB.` },
      { status: 400 }
    );
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `resources/${session.user.id}/${randomUUID()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileMimeType,
    ContentLength: fileSize, // locks the presigned URL to this exact byte size
  });

  const uploadUrl = await getSignedUrl(b2Client, command, { expiresIn: 300 });

  return NextResponse.json({ uploadUrl, fileKey, fileType: category });
}