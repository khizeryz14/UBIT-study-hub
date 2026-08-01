"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 shadow-lg max-w-sm">
      <CheckCircle2 size={18} strokeWidth={1.75} className="text-success shrink-0" />
      <p className="text-sm text-text">{message}</p>
      <button onClick={onClose} className="text-text-muted hover:text-text shrink-0">
        <X size={15} strokeWidth={1.75} />
      </button>
    </div>
  );
}