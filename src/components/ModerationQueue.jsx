"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, LoaderCircle } from "lucide-react";

export default function ModerationQueue() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/resources?status=pending");
    const data = await res.json();
    setPending(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleDecision(id, status) {
    setActingOn(id);
    await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending((prev) => prev.filter((r) => r._id !== id));
    setActingOn(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        <LoaderCircle size={20} className="animate-spin" />
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-8 text-center">
        <p className="text-sm text-text-muted">Nothing pending review.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {pending.map((resource) => (
        <div
          key={resource._id}
          className="rounded-md border border-border bg-surface p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{resource.title}</p>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {resource.course?.code} · {resource.teacher?.name} · {resource.folder?.name}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDecision(resource._id, "published")}
              disabled={actingOn === resource._id}
              className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-sm text-success hover:bg-success/20 disabled:opacity-60 transition-colors"
            >
              <Check size={14} strokeWidth={1.75} />
              Approve
            </button>
            <button
              onClick={() => handleDecision(resource._id, "rejected")}
              disabled={actingOn === resource._id}
              className="flex items-center gap-1.5 rounded-md border border-error/30 bg-error/10 px-3 py-1.5 text-sm text-error hover:bg-error/20 disabled:opacity-60 transition-colors"
            >
              <X size={14} strokeWidth={1.75} />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}