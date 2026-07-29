// src/components/AddCourseForm.jsx
"use client";

import { useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";

export default function AddCourseForm({ onSuccess }) {
  const [form, setForm] = useState({
    code: "", title: "", description: "", semester: "", creditHours: "3", curriculum: "CS",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, semester: Number(form.semester), creditHours: Number(form.creditHours) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not add course.");
      return;
    }

    setForm({ code: "", title: "", description: "", semester: "", creditHours: "3", curriculum: "CS" });
    onSuccess?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3">
      {error && (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.code}
          onChange={(e) => update("code", e.target.value)}
          placeholder="Code (e.g. CS-351)"
          required
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
        />
        <select
          value={form.curriculum}
          onChange={(e) => update("curriculum", e.target.value)}
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text outline-none focus:border-accent"
        >
          <option value="CS">CS (New)</option>
          <option value="BSCS">BSCS (Old)</option>
        </select>
      </div>
      <input
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Course title"
        required
        className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
      />
      <textarea
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent resize-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number" min="1" max="8"
          value={form.semester}
          onChange={(e) => update("semester", e.target.value)}
          placeholder="Semester (1-8)"
          required
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
        />
        <input
          type="number" min="1"
          value={form.creditHours}
          onChange={(e) => update("creditHours", e.target.value)}
          placeholder="Credit hours"
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md bg-accent py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={1.75} />}
        Add course
      </button>
    </form>
  );
}