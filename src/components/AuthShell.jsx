import Link from "next/link";
import { ArrowLeft, LibraryBig } from "lucide-react";

export default function AuthShell({ children, eyebrow, title }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      {/* Spine panel — top band on mobile, full left column on desktop */}
      <div className="relative flex md:flex-col items-center md:items-start gap-3 md:gap-6 px-6 py-5 md:py-10 md:w-64 lg:w-80 border-b md:border-b-0 md:border-r border-border bg-surface">
        <div className="flex flex-col items-start gap-2 md:gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30 text-accent">
              <LibraryBig size={20} strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <p className="font-mono text-[11px] tracking-widest text-text-muted uppercase">
                Catalog System
              </p>
              <p className="font-sans text-base md:text-lg font-medium text-text">
                UBIT Study Hub
              </p>
            </div>
          </div>

        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          Back to courses
        </Link>
        </div>

        {/* Tick-mark ruler detail — desktop only */}
        <div className="hidden md:flex flex-col gap-2 mt-auto pt-8 opacity-60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-px w-4 bg-border" />
              <span className="font-mono text-[10px] text-text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-16">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-2">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-medium text-text mb-8">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}