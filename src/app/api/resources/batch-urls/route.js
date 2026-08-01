import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { b2Client } from "@/lib/b2";
import Resource from "@/models/Resource";

export async function POST(request) {
  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  await connectDB();
  const session = await auth.api.getSession({ headers: await headers() });
  const isModOrAdmin = session && ["admin", "moderator"].includes(session.user.role);

  const resources = await Resource.find({ _id: { $in: ids } });

  const urlMap = {};
  await Promise.all(
    resources.map(async (r) => {
      const isOwner = session && r.uploadedBy.toString() === session.user.id;
      if (r.status !== "published" && !isModOrAdmin && !isOwner) return;

      if (r.fileType === "link") {
        urlMap[r._id.toString()] = r.fileUrl;
        return;
      }

      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: r.fileKey,
      });
      urlMap[r._id.toString()] = await getSignedUrl(b2Client, command, { expiresIn: 300 });
    })
  );

  return NextResponse.json({ urls: urlMap });
}