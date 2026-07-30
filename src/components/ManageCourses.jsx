"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil, X, Check, LoaderCircle, Trash2, Search } from "lucide-react";

const PAGE_SIZE = 20;

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (activeSearch) params.set("q", activeSearch);
    if (curriculumFilter) params.set("curriculum", curriculumFilter);
    if (semesterFilter) params.set("semester", semesterFilter);

    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(Array.isArray(data.courses) ? data.courses : []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, activeSearch, curriculumFilter, semesterFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  }

  function handleCurriculumChange(value) {
    setCurriculumFilter(value);
    setPage(1);
  }

  function handleSemesterChange(value) {
    setSemesterFilter(value);
    setPage(1);
  }

  function startEdit(course) {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description || "",
      semester: course.semester,
      creditHours: course.creditHours,
      curriculum: course.curriculum,
    });
  }

  async function handleSave(id) {
    setSaving(true);
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        semester: Number(form.semester),
        creditHours: Number(form.creditHours),
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setCourses((prev) => prev.map((c) => (c._id === id ? data : c)));
      setEditingId(null);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => t - 1);
      setConfirmingDeleteId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by code or title..."
            className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-9 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>

        <select
          value={curriculumFilter}
          onChange={(e) => handleCurriculumChange(e.target.value)}
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All curricula</option>
          <option value="CS">CS (New)</option>
          <option value="BSCS">BSCS (Old)</option>
        </select>

        <select
          value={semesterFilter}
          onChange={(e) => handleSemesterChange(e.target.value)}
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All semesters</option>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </form>

      <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
        {total} course{total !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-muted">
          <LoaderCircle size={20} className="animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">No courses match this search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          {courses.map((course) => (
            <div key={course._id} className="rounded-md border border-border bg-surface p-3">
              {editingId === course._id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-muted">{course.code}</span>
                    <select
                      value={form.curriculum}
                      onChange={(e) => setForm((f) => ({ ...f, curriculum: e.target.value }))}
                      className="rounded-md border border-border bg-surface-2 py-1 px-2 text-xs text-text outline-none focus:border-accent"
                    >
                      <option value="CS">CS</option>
                      <option value="BSCS">BSCS</option>
                    </select>
                  </div>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number" min="1" max="8"
                      value={form.semester}
                      onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                      className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent"
                    />
                    <input
                      type="number" min="1"
                      value={form.creditHours}
                      onChange={(e) => setForm((f) => ({ ...f, creditHours: e.target.value }))}
                      className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
                    >
                      <X size={13} strokeWidth={1.75} /> Cancel
                    </button>
                    <button
                      onClick={() => handleSave(course._id)}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs text-success hover:bg-success/20 disabled:opacity-60"
                    >
                      {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} strokeWidth={1.75} />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-text-muted">
                      {course.code} · Sem {course.semester} · {course.curriculum}
                    </p>
                    <p className="text-sm font-medium text-text truncate">{course.title}</p>
                  </div>

                  {confirmingDeleteId === course._id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-error">Delete + all its resources?</span>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className="text-xs text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        disabled={deleting}
                        className="flex items-center gap-1 rounded-md border border-error/30 bg-error/10 px-2 py-1 text-xs text-error hover:bg-error/20 disabled:opacity-60"
                      >
                        {deleting ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} strokeWidth={1.75} />}
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(course)}
                        className="text-text-muted hover:text-accent transition-colors"
                      >
                        <Pencil size={15} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(course._id)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 size={15} strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-text-muted">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}