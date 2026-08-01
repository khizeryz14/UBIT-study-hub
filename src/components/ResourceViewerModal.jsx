"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, LoaderCircle } from "lucide-react";

export default function ResourceViewerModal({ items, currentIndex, onClose, onNavigate }) {
  const current = items[currentIndex];

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
    },
    [currentIndex, items.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleDownload() {
    if (!current?.url) return;
    const res = await fetch(current.url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = current.title;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
        <X size={24} strokeWidth={1.75} />
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>
      )}
      {currentIndex < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>
      )}

      <div className="flex flex-col items-center gap-4 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        {!current.url ? (
          <LoaderCircle size={32} className="animate-spin text-white/70" />
        ) : current.fileType === "video" ? (
          <video src={current.url} controls autoPlay className="max-h-[75vh] max-w-full rounded-md" />
        ) : (
          <img src={current.url} alt={current.title} className="max-h-[75vh] max-w-full rounded-md object-contain" />
        )}

        <div className="flex items-center justify-between w-full px-2">
          <p className="text-sm text-white/80 truncate">{current.title}</p>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-white/50">{currentIndex + 1} / {items.length}</span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition-colors"
            >
              <Download size={14} strokeWidth={1.75} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}