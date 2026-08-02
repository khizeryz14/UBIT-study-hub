"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, LoaderCircle } from "lucide-react";
import { getGradeForMarks, getGradeColors } from "@/lib/gradeTable";
import ResultsLookup from "./ResultsLookup";

export default function GradeRow({ grade, resultsFolderId, onSave, onRemove }) {
  const [draft, setDraft] = useState(grade.marks ?? "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const draftNumber = draft === "" ? null : Number(draft);
  const preview = draftNumber !== null && !isNaN(draftNumber) ? getGradeForMarks(draftNumber) : null;
  const displayGradePoint = preview ? preview.gradePoint : grade.gradePoint;
  const displayLetter = preview ? preview.letterGrade : grade.letterGrade;
  const colors = getGradeColors(displayGradePoint);

  async function handleBlur() {
    const numeric = draft === "" ? null : Number(draft);
    if (numeric !== null && (isNaN(numeric) || numeric < 0 || numeric > 100)) {
      setDraft(grade.marks ?? "");
      return;
    }
    if (numeric === (grade.marks ?? null)) return;
    setSaving(true);
    await onSave(grade._id, numeric);
    setSaving(false);
  }

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center gap-3 p-3">
        <button onClick={() => setExpanded((v) => !v)} className="text-text-muted hover:text-text shrink-0">
          {expanded ? <ChevronUp size={15} strokeWidth={1.75} /> : <ChevronDown size={15} strokeWidth={1.75} />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-text-muted">
            {grade.course?.code} · {grade.course?.creditHours} Cr.Hrs
          </p>
          <p className="text-sm text-text truncate">{grade.course?.title}</p>
        </div>

        <input
          type="number"
          min="0"
          max="100"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          placeholder="Marks"
          className="w-20 rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text text-center outline-none focus:border-accent"
        />

        <div
          className={`flex flex-col items-center justify-center rounded-md border px-2 py-1 w-16 shrink-0 ${colors.bg} ${colors.border} ${colors.text}`}
        >
          {saving ? (
            <LoaderCircle size={12} className="animate-spin" />
          ) : displayGradePoint !== null ? (
            <>
              <span className="text-xs font-mono leading-none">{displayGradePoint.toFixed(1)}</span>
              <span className="text-[9px] leading-none mt-0.5">{displayLetter}</span>
            </>
          ) : (
            <span className="text-xs text-text-muted">—</span>
          )}
        </div>

        <button onClick={() => onRemove(grade._id)} className="text-text-muted hover:text-error transition-colors shrink-0">
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-3">
          <ResultsLookup courseId={grade.course?._id} resultsFolderId={resultsFolderId} />
        </div>
      )}
    </div>
  );
}