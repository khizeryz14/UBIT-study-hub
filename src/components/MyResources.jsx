"use client";

import { useState, useEffect, useCallback } from "react";
import { LoaderCircle, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Pending review" },
  published: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/30", label: "Published" },
  rejected: { icon: XCircle, color: "text-error", bg: "bg-error/10 border-error/30", label: "Rejected" },
};

export default function MyResources() {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/resources/mine?page=${page}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    setResources(Array.isArray(data.resources) ? data.resources : []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        <LoaderCircle size={20} className="animate-spin" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-8 text-center">
        <FileText size={24} strokeWidth={1.75} className="mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-muted">You haven&apos;t submitted anything yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
        {total} submission{total !== 1 ? "s" : ""}
      </p>

      <div className="flex flex-col gap-2">
        {resources.map((resource) => {
          const config = STATUS_CONFIG[resource.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={resource._id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{resource.title}</p>
                <p className="text-xs text-text-muted font-mono truncate">
                  {resource.course?.code} · {resource.teacher?.name} · {resource.folder?.name}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 shrink-0 rounded-md border px-2 py-1 text-xs ${config.bg} ${config.color}`}>
                <StatusIcon size={13} strokeWidth={1.75} />
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors">Previous</button>
          <span className="font-mono text-xs text-text-muted">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}