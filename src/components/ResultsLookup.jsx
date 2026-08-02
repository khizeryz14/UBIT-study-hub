"use client";

import { useState, useEffect } from "react";
import { LoaderCircle, FileText, ExternalLink } from "lucide-react";

export default function ResultsLookup({ courseId, resultsFolderId }) {
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    if (!resultsFolderId || !courseId) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ course: courseId, folder: resultsFolderId, limit: "50" });
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      const list = Array.isArray(data.resources) ? data.resources : [];
      const byTeacher = {};
      for (const r of list) {
        const teacherName = r.teacher?.name || "Unknown";
        if (!byTeacher[teacherName]) byTeacher[teacherName] = [];
        byTeacher[teacherName].push(r);
      }
      setGrouped(byTeacher);
      setLoading(false);
    })();
  }, [courseId, resultsFolderId]);

  async function handleOpen(resourceId) {
    const res = await fetch(`/api/resources/${resourceId}/download`);
    const data = await res.json();
    if (res.ok) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted py-2">
        <LoaderCircle size={13} className="animate-spin" /> Checking for posted results...
      </div>
    );
  }

  const teacherNames = Object.keys(grouped);

  if (teacherNames.length === 0) {
    return <p className="text-xs text-text-muted py-2">No results posted for this course yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      {teacherNames.map((teacherName) => (
        <div key={teacherName}>
          <p className="font-mono text-[10px] tracking-wide text-text-muted uppercase mb-1">{teacherName}</p>
          <div className="flex flex-wrap gap-1.5">
            {grouped[teacherName].map((r) => (
              <button
                key={r._id}
                onClick={() => handleOpen(r._id)}
                className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-text hover:border-accent/50 transition-colors"
              >
                <FileText size={11} strokeWidth={1.75} />
                {r.title}
                <ExternalLink size={10} strokeWidth={1.75} className="text-text-muted" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}