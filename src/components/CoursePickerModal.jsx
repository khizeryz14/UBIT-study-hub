"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, LoaderCircle, Check } from "lucide-react";

export default function CoursePickerModal({ defaultSemester, existingCourseIds, onClose, onConfirm }) {
  const [curriculum, setCurriculum] = useState("CS");
  const [semesterFilter, setSemesterFilter] = useState(String(defaultSemester));
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ curriculum, limit: "50" });
    if (semesterFilter !== "all") params.set("semester", semesterFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(Array.isArray(data.courses) ? data.courses : []);
    setLoading(false);
  }, [curriculum, semesterFilter, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    setSubmitting(true);
    await onConfirm([...selected]);
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-md border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <p className="text-sm font-medium text-text">Add courses to Semester {defaultSemester}</p>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2 border-b border-border">
          <div className="relative">
            <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any course..."
              className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="CS">CS (New)</option>
              <option value="BSCS">BSCS (Old)</option>
            </select>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="all">All semesters</option>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  Semester {s} {s === defaultSemester ? "(current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-text-muted">
              <LoaderCircle size={18} className="animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No courses found.</p>
          ) : (
            courses.map((course) => {
              const alreadyAdded = existingCourseIds.has(course._id);
              const isSelected = selected.has(course._id);
              return (
                <button
                  key={course._id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => toggle(course._id)}
                  className={`w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors ${
                    alreadyAdded
                      ? "opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "bg-accent/10 border border-accent/30"
                      : "hover:bg-surface-2 border border-transparent"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-text-muted">
                      {course.code} · Sem {course.semester}
                    </p>
                    <p className="text-sm text-text truncate">{course.title}</p>
                  </div>
                  {isSelected && <Check size={16} strokeWidth={1.75} className="text-accent shrink-0" />}
                  {alreadyAdded && <span className="text-[10px] text-text-muted shrink-0">Added</span>}
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">{selected.size} selected</span>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || submitting}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={14} className="animate-spin" />}
            Add {selected.size > 0 ? selected.size : ""} course{selected.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}