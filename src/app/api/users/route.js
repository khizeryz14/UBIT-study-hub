import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const q = searchParams.get("q")?.trim();
  const role = searchParams.get("role");

  const client = await clientPromise;
  const db = client.db();

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  if (role && ["member", "moderator", "admin"].includes(role)) {
    filter.role = role;
  }

  const total = await db.collection("user").countDocuments(filter);
  const users = await db
    .collection("user")
    .find(filter, { projection: { name: 1, email: 1, role: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return NextResponse.json({ users, total, page, limit });
}