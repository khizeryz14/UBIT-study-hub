import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Folder from "@/models/Folder";

function slugify(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET() {
  await connectDB();
  const folders = await Folder.find().sort({ name: 1 });
  return NextResponse.json(folders);
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden — admin or moderator only" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await connectDB();

  const slug = slugify(name);
  const existing = await Folder.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 });
  }

  const folder = await Folder.create({
    name: name.trim(),
    slug,
    description: description || "",
    createdBy: session.user.id,
  });

  return NextResponse.json(folder, { status: 201 });
}