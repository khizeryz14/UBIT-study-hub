"use client";

import { useState, useEffect, useCallback, } from "react";
import { Check, X, LoaderCircle, FileText, Image as ImageIcon, Film, Link as LinkIcon, FileSpreadsheet, FileType, ExternalLink } from "lucide-react";

const FILE_ICONS = { pdf: FileText, image: ImageIcon, video: Film, link: LinkIcon, doc: FileType, sheet: FileSpreadsheet, slides: FileType, text: FileText };

export default function ModerationQueue() {
  const [pending, setPending] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/resources?status=pending&limit=50");
    const data = await res.json();
    const list = Array.isArray(data.resources) ? data.resources : [];
    setPending(list);
    setLoading(false);

    // Resolve real preview/download URLs for every pending item up front —
    // moderators need to actually see/open the file to make a real decision,
    // not just read the title.
    const ids = list.filter((r) => r.fileType !== "link").map((r) => r._id);
    if (ids.length > 0) {
      const urlRes = await fetch("/api/resources/batch-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const urlData = await urlRes.json();
      setPreviewUrls(urlData.urls || {});
    }
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
      {pending.map((resource) => {
        const Icon = FILE_ICONS[resource.fileType] || FileText;
        const url = resource.fileType === "link" ? resource.fileUrl : previewUrls[resource._id];

        return (
          <div key={resource._id} className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 h-16 w-16 rounded-md border border-border bg-surface-2 overflow-hidden flex items-center justify-center">
                {resource.fileType === "image" && url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : resource.fileType === "video" && url ? (
                  <video src={url} className="w-full h-full object-cover" muted />
                ) : (
                  <Icon size={22} strokeWidth={1.5} className="text-accent/60" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">{resource.title}</p>
                <p className="text-xs text-text-muted font-mono mt-0.5 truncate">
                  {resource.course?.code} · {resource.teacher?.name} · {resource.folder?.name}
                </p>
                {resource.description && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{resource.description}</p>
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-1.5 w-fit"
                  >
                    <ExternalLink size={12} strokeWidth={1.75} />
                    Open full file
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
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
        );
      })}
    </div>
  );
}