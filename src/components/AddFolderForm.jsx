// src/components/AddFolderForm.jsx
"use client";

import { useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";

export default function AddFolderForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;

    setLoading(true);
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not add folder.");
      return;
    }

    setName("");
    setDescription("");
    onSuccess?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3">
      {error && (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Folder name (e.g. Lab Manuals)"
        className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md bg-accent py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={1.75} />}
        Add folder
      </button>
    </form>
  );
}