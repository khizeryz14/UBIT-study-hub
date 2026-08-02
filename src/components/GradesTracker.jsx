"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LoaderCircle } from "lucide-react";
import { getGradeColors } from "@/lib/gradeTable";
import CoursePickerModal from "./CoursePickerModal";
import GradeRow from "./GradeRow";

export default function GradesTracker() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsFolderId, setResultsFolderId] = useState(null);
  const [pickerSemester, setPickerSemester] = useState(null);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/grades");
    const data = await res.json();
    setGrades(Array.isArray(data.grades) ? data.grades : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGrades();
    fetch("/api/folders")
      .then((res) => res.json())
      .then((folders) => {
        const resultsFolder = (Array.isArray(folders) ? folders : []).find((f) => f.slug === "results");
        if (resultsFolder) setResultsFolderId(resultsFolder._id);
      });
  }, [fetchGrades]);

  async function handleSaveMarks(gradeId, marks) {
    const res = await fetch(`/api/grades/${gradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGrades((prev) => prev.map((g) => (g._id === gradeId ? { ...g, ...updated, course: g.course } : g)));
    }
  }

  async function handleRemove(gradeId) {
    await fetch(`/api/grades/${gradeId}`, { method: "DELETE" });
    setGrades((prev) => prev.filter((g) => g._id !== gradeId));
  }

  async function handleConfirmAdd(courseIds) {
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semester: pickerSemester, courseIds }),
    });
    setPickerSemester(null);
    fetchGrades();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        <LoaderCircle size={20} className="animate-spin" />
      </div>
    );
  }

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const semesterCGPRs = {};
  for (const sem of semesters) {
    const marked = grades.filter(
      (g) => g.semester === sem && g.marks !== null && g.marks !== undefined && g.course?.creditHours
    );
    if (marked.length === 0) {
      semesterCGPRs[sem] = null;
      continue;
    }
    const totalPoints = marked.reduce((sum, g) => sum + g.gradePoint * g.course.creditHours, 0);
    const totalCredits = marked.reduce((sum, g) => sum + g.course.creditHours, 0);
    semesterCGPRs[sem] = totalCredits > 0 ? totalPoints / totalCredits : null;
  }

    const allMarked = grades.filter(
    (g) => g.marks !== null && g.marks !== undefined && g.course?.creditHours
    );
    const overallTotalPoints = allMarked.reduce((sum, g) => sum + g.gradePoint * g.course.creditHours, 0);
    const overallTotalCredits = allMarked.reduce((sum, g) => sum + g.course.creditHours, 0);
    const overallCGPA = overallTotalCredits > 0 ? overallTotalPoints / overallTotalCredits : null;
    const overallColors = getGradeColors(overallCGPA);

  const existingCourseIds = new Set(grades.map((g) => g.course?._id));

  return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-md border p-4 flex items-center justify-between ${overallColors.bg} ${overallColors.border}`}>
        <div>
          <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">Overall CGPA</p>
          <p className={`text-2xl font-medium ${overallColors.text}`}>
            {overallCGPA !== null ? overallCGPA.toFixed(2) : "—"}
          </p>
        </div>
        <p className="text-xs text-text-muted text-right max-w-[45%]">
          Weighted across all marked courses and credit hours
        </p>
      </div>

      {semesters.map((sem) => {
        const semGrades = grades.filter((g) => g.semester === sem);
        const cgpr = semesterCGPRs[sem];
        const colors = getGradeColors(cgpr);

        return (
          <div key={sem}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">Semester {sem}</h3>
                {cgpr !== null && (
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-mono ${colors.bg} ${colors.border} ${colors.text}`}>
                    CGPR {cgpr.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setPickerSemester(sem)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-muted hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Plus size={13} strokeWidth={1.75} />
                Add course
              </button>
            </div>

            {semGrades.length === 0 ? (
              <p className="text-xs text-text-muted">No courses added for this semester yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {semGrades.map((grade) => (
                  <GradeRow
                    key={grade._id}
                    grade={grade}
                    resultsFolderId={resultsFolderId}
                    onSave={handleSaveMarks}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {pickerSemester !== null && (
        <CoursePickerModal
          defaultSemester={pickerSemester}
          existingCourseIds={existingCourseIds}
          onClose={() => setPickerSemester(null)}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
}