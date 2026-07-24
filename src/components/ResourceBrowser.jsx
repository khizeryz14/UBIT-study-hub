"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Folder as FolderIcon, FileText, Link as LinkIcon, Film, Image as ImageIcon, LoaderCircle, Inbox } from "lucide-react";

const FILE_ICONS = {
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  link: LinkIcon,
};

export default function ResourceBrowser({ courseId, teachers, folders }) {
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]?._id || null);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?._id || null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    if (!selectedTeacher || !selectedFolder) return;
    setLoading(true);
    const params = new URLSearchParams({
      course: courseId,
      teacher: selectedTeacher,
      folder: selectedFolder,
    });
    const res = await fetch(`/api/resources?${params}`);
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [courseId, selectedTeacher, selectedFolder]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (teachers.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-8 text-center">
        <p className="text-sm text-text-muted">
          No teachers added for this course yet. An admin or moderator needs to add one first.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Teacher selector */}
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase mb-2">
          Taught by
        </p>
        <div className="flex flex-wrap gap-2">
          {teachers.map((teacher) => (
            <button
              key={teacher._id}
              onClick={() => setSelectedTeacher(teacher._id)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                selectedTeacher === teacher._id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-muted hover:text-text"
              }`}
            >
              <User size={14} strokeWidth={1.75} />
              {teacher.name}
            </button>
          ))}
        </div>
      </div>

      {/* Folder tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex flex-wrap gap-1 -mb-px">
          {folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => setSelectedFolder(folder._id)}
              className={`flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors ${
                selectedFolder === folder._id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <FolderIcon size={14} strokeWidth={1.75} />
              {folder.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resource list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-muted">
          <LoaderCircle size={20} className="animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center">
          <Inbox size={24} strokeWidth={1.75} className="mx-auto mb-2 text-text-muted" />
          <p className="text-sm text-text-muted">Nothing here yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((resource) => {
            const Icon = FILE_ICONS[resource.fileType] || FileText;
            return (
              <div
                key={resource._id}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 border border-accent/30 text-accent">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{resource.title}</p>
                  {resource.description && (
                    <p className="text-xs text-text-muted truncate">{resource.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}