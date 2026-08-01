import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";

export async function GET(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  await connectDB();

  const filter = { uploadedBy: session.user.id };
  const total = await Resource.countDocuments(filter);
  const resources = await Resource.find(filter)
    .populate("course", "code title")
    .populate("teacher", "name")
    .populate("folder", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ resources, total, page, limit });
}