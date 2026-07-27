"use client";

import { useState } from "react";
import { UserPlus, LoaderCircle } from "lucide-react";

export default function AddTeacherForm({ courseId, onSuccess }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;

    setLoading(true);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), course: courseId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not add teacher.");
      return;
    }

    setName("");
    onSuccess?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add teacher name"
        className="rounded-md border border-border bg-surface-2 py-1.5 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20 disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : (
          <UserPlus size={14} strokeWidth={1.75} />
        )}
        Add
      </button>
      {error && <span className="text-xs text-error">{error}</span>}
    </form>
  );
}