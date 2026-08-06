import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export const getCourses = unstable_cache(
  async (curriculum, q) => {
    await connectDB();
    const filter = { curriculum };
    if (q) filter.$text = { $search: q };
    return Course.find(filter).sort({ semester: 1, code: 1 }).lean();
  },
  ["courses"],           // cache key prefix
  { revalidate: 3600, tags: ["courses"] }
);