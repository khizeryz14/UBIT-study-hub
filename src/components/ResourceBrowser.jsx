"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User, Folder as FolderIcon, FileText, Link as LinkIcon, Film,
  Image as ImageIcon, LoaderCircle, Inbox, Plus, Search, X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import SubmitResourceForm from "./SubmitResourceForm";
import AddTeacherForm from "./AddTeacherForm";

const FILE_ICONS = { pdf: FileText, image: ImageIcon, video: Film, link: LinkIcon };
const PAGE_SIZE = 20;

export default function ResourceBrowser({ courseId, teachers: initialTeachers, folders }) {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState(initialTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState(initialTeachers[0]?._id || null);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?._id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const canModerate = session && ["admin", "moderator"].includes(session.user.role);
  const isSearching = activeSearch.trim().length > 0;

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      course: courseId,
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (isSearching) {
      params.set("q", activeSearch.trim());
    } else {
      if (!selectedTeacher || !selectedFolder) {
        setLoading(false);
        return;
      }
      params.set("teacher", selectedTeacher);
      params.set("folder", selectedFolder);
    }

    const res = await fetch(`/api/resources?${params}`);
    const data = await res.json();
    setResources(Array.isArray(data.resources) ? data.resources : []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [courseId, selectedTeacher, selectedFolder, isSearching, activeSearch, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  }

  function clearSearch() {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  }

  async function handleOpenResource(resourceId) {
    const res = await fetch(`/api/resources/${resourceId}/download`);
    const data = await res.json();
    if (res.ok) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Search bar — overrides tab filtering when active */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources in this course..."
            className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-9 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </form>

      {!isSearching && (
        <>
          {/* Teacher selector */}
          <div className="mb-6">
            <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase mb-2">
              Taught by
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {teachers.map((teacher) => (
                <button
                  key={teacher._id}
                  onClick={() => { setSelectedTeacher(teacher._id); setPage(1); }}
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

            {canModerate && (
              <div className="mt-3">
                <AddTeacherForm
                  courseId={courseId}
                  onSuccess={(newTeacher) => {
                    setTeachers((prev) => [...prev, newTeacher]);
                    setSelectedTeacher(newTeacher._id);
                  }}
                />
              </div>
            )}
          </div>

          {teachers.length > 0 && (
            <div className="mb-6 border-b border-border">
              <div className="flex flex-wrap gap-1 -mb-px">
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => { setSelectedFolder(folder._id); setPage(1); }}
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
          )}
        </>
      )}

      {teachers.length === 0 && !isSearching ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">
            No teachers added for this course yet.
            {canModerate ? " Add one above." : " Check back soon."}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            {!session ? (
              <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
                <a href="/login" className="text-accent hover:text-accent-hover">Login</a> to submit a resource.
              </div>
            ) : showSubmitForm ? (
              <SubmitResourceForm
                courseId={courseId}
                teacherId={selectedTeacher}
                folderId={selectedFolder}
                onCancel={() => setShowSubmitForm(false)}
                onSuccess={() => { setShowSubmitForm(false); fetchResources(); }}
              />
            ) : !isSearching ? (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Plus size={14} strokeWidth={1.75} />
                Submit a resource
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-muted">
              <LoaderCircle size={20} className="animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-8 text-center">
              <Inbox size={24} strokeWidth={1.75} className="mx-auto mb-2 text-text-muted" />
              <p className="text-sm text-text-muted">
                {isSearching ? "No matches found." : "Nothing here yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {resources.map((resource) => {
                  const Icon = FILE_ICONS[resource.fileType] || FileText;
                  return (
                    <button
                      key={resource._id}
                      onClick={() => handleOpenResource(resource._id)}
                      className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 text-left hover:border-accent/50 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 border border-accent/30 text-accent">
                        <Icon size={16} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text truncate">{resource.title}</p>
                        {isSearching && (
                          <p className="text-xs text-text-muted font-mono truncate">
                            {resource.teacher?.name} · {resource.folder?.name}
                          </p>
                        )}
                        {resource.description && (
                          <p className="text-xs text-text-muted truncate">{resource.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-xs text-text-muted">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}