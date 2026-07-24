import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher";
import Folder from "@/models/Folder";
import ResourceBrowser from "@/components/ResourceBrowser";

export default async function CourseDetailPage({ params }) {
  const { courseId } = await params;

  await connectDB();

  const course = await Course.findById(courseId).lean();
  if (!course) notFound();

  const [teachers, folders] = await Promise.all([
    Teacher.find({ course: courseId }).sort({ name: 1 }).lean(),
    Folder.find().sort({ name: 1 }).lean(),
  ]);

  // Server Components can pass data to Client Components as props, but only
  // if it's serializable — Mongo ObjectIds/Dates aren't plain JSON, so we
  // normalize everything through a stringify/parse round-trip here.
  const serialized = JSON.parse(
    JSON.stringify({ course, teachers, folders })
  );

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-3 mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 border border-accent/30 text-accent">
            <GraduationCap size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-1">
              {serialized.course.code} · Semester {serialized.course.semester}
            </p>
            <h1 className="text-2xl font-medium text-text">{serialized.course.title}</h1>
            {serialized.course.description && (
              <p className="text-sm text-text-muted mt-2 max-w-2xl">
                {serialized.course.description}
              </p>
            )}
          </div>
        </div>

        <ResourceBrowser
          courseId={serialized.course._id}
          teachers={serialized.teachers}
          folders={serialized.folders}
        />
      </div>
    </div>
  );
}