import Link from "next/link";
import { BookOpen, X } from "lucide-react";
import { getCourses } from "@/lib/queries/courses";

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;
  const curriculum = params?.curriculum === "BSCS" ? "BSCS" : "CS";
  const q = params?.q?.trim();

  const courses = await getCourses(curriculum, q);

  const bySemester = {};
  for (const c of courses) {
    if (!bySemester[c.semester]) bySemester[c.semester] = [];
    bySemester[c.semester].push(c);
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <p className="font-mono text-xs tracking-widest text-accent uppercase mb-1">Catalog</p>
              <h1 className="text-2xl font-medium text-text">Courses</h1>
            </div>
            <div className="flex rounded-md border border-border overflow-hidden w-fit">
              <Link
                href={`/courses?curriculum=CS${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 text-sm font-mono transition-colors ${
                  curriculum === "CS" ? "bg-accent text-bg" : "bg-surface text-text-muted hover:text-text"
                }`}
              >
                CS (New)
              </Link>
              <Link
                href={`/courses?curriculum=BSCS${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 text-sm font-mono transition-colors ${
                  curriculum === "BSCS" ? "bg-accent text-bg" : "bg-surface text-text-muted hover:text-text"
                }`}
              >
                BSCS (Old)
              </Link>
            </div>
          </div>
            <form action="/courses" className="relative">
              <input type="hidden" name="curriculum" value={curriculum} />
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Search by course code or title..."
                className="w-full rounded-md border border-border bg-surface-2 py-2.5 pl-4 pr-10 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {q && (
                <Link
                  href={`/courses?curriculum=${curriculum}`}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  <X size={16} strokeWidth={1.75} />
                </Link>
              )}
            </form>
        </div>

        {Object.keys(bySemester).sort((a, b) => a - b).map((sem) => (
          <div key={sem} className="mb-10">
            <h2 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-3">
              Semester {sem}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bySemester[sem].map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="group rounded-md border border-border bg-surface p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 border border-accent/30 text-accent">
                      <BookOpen size={16} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-text-muted">{course.code}</p>
                      <p className="text-sm font-medium text-text group-hover:text-accent transition-colors truncate">
                        {course.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <p className="text-sm text-text-muted">No courses found for this curriculum.</p>
        )}
      </div>
    </div>
  );
}