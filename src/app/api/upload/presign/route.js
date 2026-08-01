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
  "image/webp": "image",
  "video/mp4": "video",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
  "application/vnd.ms-excel": "sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sheet",
  "text/csv": "sheet",
  "application/vnd.ms-powerpoint": "slides",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "slides",
  "text/plain": "text",
};

const MAX_SIZE_BY_CATEGORY = {
  pdf: 200 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  doc: 50 * 1024 * 1024,
  sheet: 50 * 1024 * 1024,
  slides: 50 * 1024 * 1024,
  text: 10 * 1024 * 1024,
};

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fileName, fileMimeType, fileSize, hasThumb, thumbMimeType } = body;

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
  const uid = randomUUID();
  const fileKey = `resources/${session.user.id}/${uid}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    b2Client,
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileMimeType,
      ContentLength: fileSize,
    }),
    { expiresIn: 300 }
  );

  let thumbUploadUrl = null;
  let thumbKey = null;
  if (hasThumb) {
    thumbKey = `resources/${session.user.id}/thumb_${uid}.jpg`;
    thumbUploadUrl = await getSignedUrl(
      b2Client,
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: thumbKey,
        ContentType: thumbMimeType || "image/jpeg",
      }),
      { expiresIn: 300 }
    );
  }

  return NextResponse.json({ uploadUrl, fileKey, thumbUploadUrl, thumbKey, fileType: category });
}