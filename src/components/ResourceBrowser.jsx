"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  User, Folder as FolderIcon, FileText, Link as LinkIcon, Film,
  Image as ImageIcon, LoaderCircle, Inbox, Plus, Search, X,
  CheckSquare, Square, Download, Trash2, FileSpreadsheet, FileType,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import SubmitResourceForm from "./SubmitResourceForm";
import AddTeacherForm from "./AddTeacherForm";
import ResourceViewerModal from "./ResourceViewerModal";
import Toast from "./Toast";

const FILE_ICONS = {
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  link: LinkIcon,
  doc: FileType,
  sheet: FileSpreadsheet,
  slides: FileType,
  text: FileText,
};
const PAGE_SIZE = 24;
const HOLD_DURATION = 500;

function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

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
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [thumbUrls, setThumbUrls] = useState({});
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [modalUrls, setModalUrls] = useState({});
  const holdTimer = useRef(null);
  const heldRef = useRef(false);

  const canModerate = session && ["admin", "moderator"].includes(session.user.role);
  const isSearching = activeSearch.trim().length > 0;

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ course: courseId, page: String(page), limit: String(PAGE_SIZE) });
    if (isSearching) {
      params.set("q", activeSearch.trim());
    } else {
      if (!selectedTeacher || !selectedFolder) { setLoading(false); return; }
      params.set("teacher", selectedTeacher);
      params.set("folder", selectedFolder);
    }
    const res = await fetch(`/api/resources?${params}`);
    const data = await res.json();
    const list = Array.isArray(data.resources) ? data.resources : [];
    setResources(list);
    setTotal(data.total || 0);
    setLoading(false);

    const thumbIds = list.filter((r) => r.thumbKey).map((r) => r._id);
    if (thumbIds.length > 0) {
      const urlRes = await fetch("/api/resources/batch-thumbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: thumbIds }),
      });
      const urlData = await urlRes.json();
      setThumbUrls(urlData.urls || {});
    } else {
      setThumbUrls({});
    }
  }, [courseId, selectedTeacher, selectedFolder, isSearching, activeSearch, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  }
  function clearSearch() { setSearchQuery(""); setActiveSearch(""); setPage(1); }

  const previewableItems = resources.filter((r) => r.fileType === "image" || r.fileType === "video");

  async function loadModalUrl(previewIndex) {
    const resource = previewableItems[previewIndex];
    if (modalUrls[resource._id]) return;
    const res = await fetch("/api/resources/batch-urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [resource._id] }),
    });
    const data = await res.json();
    setModalUrls((prev) => ({ ...prev, ...data.urls }));
  }

  async function openModalFor(resource) {
    const previewIndex = previewableItems.findIndex((r) => r._id === resource._id);
    if (previewIndex === -1) return;
    setModalIndex(previewIndex);
    await loadModalUrl(previewIndex);
  }

  function handleModalNavigate(newIndex) {
    setModalIndex(newIndex);
    loadModalUrl(newIndex);
  }

  async function handleCardClick(resource) {
    if (heldRef.current) { heldRef.current = false; return; }
    if (selectionMode) { toggleSelected(resource._id); return; }
    if (resource.fileType === "image" || resource.fileType === "video") {
      openModalFor(resource);
      return;
    }
    const res = await fetch(`/api/resources/${resource._id}/download`);
    const data = await res.json();
    if (res.ok) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startHold(id) {
    holdTimer.current = setTimeout(() => {
      heldRef.current = true;
      setSelectionMode(true);
      toggleSelected(id);
    }, HOLD_DURATION);
  }
  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  const selectedResources = resources.filter((r) => selectedIds.has(r._id));
  const canDeleteSelection =
    selectedResources.length > 0 && (canModerate || selectedResources.every((r) => r.isOwn));

  async function handleBulkDownload() {
    setBulkBusy(true);
    const ids = [...selectedIds];
    const res = await fetch("/api/resources/batch-urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    for (const resource of selectedResources) {
      const url = data.urls?.[resource._id];
      if (!url) continue;
      const fileRes = await fetch(url);
      const blob = await fileRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = resource.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    }
    setBulkBusy(false);
  }

  async function handleBulkDelete() {
    setBulkBusy(true);
    await fetch("/api/resources/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selectedIds] }),
    });
    setBulkBusy(false);
    exitSelectionMode();
    fetchResources();
  }

  async function handleSingleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || `Delete failed (${res.status})`);
      return;
    }

    setConfirmingDeleteId(null);
    setDeleteError(null);
    fetchResources();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources in this course..."
            className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-9 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {isSearching && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <X size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>
        {!selectionMode && resources.length > 0 && (
          <button type="button" onClick={() => setSelectionMode(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors shrink-0">
            <CheckSquare size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Select</span>
          </button>
        )}
      </form>

      {selectionMode && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-accent/30 bg-accent/10 px-4 py-2.5">
          <span className="text-sm text-text">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkDownload} disabled={selectedIds.size === 0 || bulkBusy}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text hover:border-accent/50 disabled:opacity-50 transition-colors">
              {bulkBusy ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} strokeWidth={1.75} />}
              <span className="hidden sm:inline">Download</span>
            </button>
            {canDeleteSelection && (
              <button onClick={handleBulkDelete} disabled={bulkBusy}
                className="flex items-center gap-1.5 rounded-md border border-error/30 bg-error/10 px-3 py-1.5 text-sm text-error hover:bg-error/20 disabled:opacity-50 transition-colors">
                <Trash2 size={14} strokeWidth={1.75} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button onClick={exitSelectionMode} className="text-sm text-text-muted hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {!isSearching && (
        <>
          <div className="mb-6">
            <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase mb-2">Taught by</p>
            <div className="flex flex-wrap items-center gap-2">
              {teachers.map((teacher) => (
                <button key={teacher._id} onClick={() => { setSelectedTeacher(teacher._id); setPage(1); }}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${selectedTeacher === teacher._id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-text-muted hover:text-text"}`}>
                  <User size={14} strokeWidth={1.75} />
                  {teacher.name}
                </button>
              ))}
            </div>
            {canModerate && (
              <div className="mt-3">
                <AddTeacherForm courseId={courseId} onSuccess={(nt) => { setTeachers((p) => [...p, nt]); setSelectedTeacher(nt._id); }} />
              </div>
            )}
          </div>

          {teachers.length > 0 && (
            <div className="mb-6 border-b border-border">
              <div className="flex flex-wrap gap-1 -mb-px">
                {folders.map((folder) => (
                  <button key={folder._id} onClick={() => { setSelectedFolder(folder._id); setPage(1); }}
                    className={`flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors ${selectedFolder === folder._id ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text"}`}>
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
          <p className="text-sm text-text-muted">No teachers added for this course yet.{canModerate ? " Add one above." : " Check back soon."}</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            {!session ? (
              <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
                <a href="/login" className="text-accent hover:text-accent-hover">Login</a> to submit a resource.
              </div>
            ) : showSubmitForm ? (
              <SubmitResourceForm courseId={courseId} teacherId={selectedTeacher} folderId={selectedFolder}
                onCancel={() => setShowSubmitForm(false)}
                onSuccess={(data) => {
                  setShowSubmitForm(false);
                  fetchResources();
                  const isMember = session.user.role === "member";
                  setToastMessage(
                    isMember
                      ? "Submitted — pending review before it appears publicly."
                      : "Resource published."
                  );
                }} />
            ) : !isSearching && !selectionMode ? (
              <button onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors">
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
              <p className="text-sm text-text-muted">{isSearching ? "No matches found." : "Nothing here yet."}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {resources.map((resource) => {
                  const Icon = FILE_ICONS[resource.fileType] || FileText;
                  const isSelected = selectedIds.has(resource._id);
                  const canDeleteThis = canModerate || resource.isOwn;
                  const thumb = thumbUrls[resource._id];

                  return (
                    <div
                      key={resource._id}
                      onPointerDown={() => startHold(resource._id)}
                      onPointerUp={cancelHold}
                      onPointerLeave={cancelHold}
                      onClick={() => handleCardClick(resource)}
                      className={`group relative flex flex-col rounded-md border overflow-hidden cursor-pointer transition-colors ${isSelected ? "border-accent" : "border-border hover:border-accent/50"}`}
                    >
                      {selectionMode && (
                        <span className="absolute top-1.5 left-1.5 z-10 text-accent bg-bg/80 rounded-md p-0.5">
                          {isSelected ? <CheckSquare size={16} strokeWidth={1.75} /> : <Square size={16} strokeWidth={1.75} className="text-text-muted" />}
                        </span>
                      )}

                  {!selectionMode && canDeleteThis && (
                    confirmingDeleteId === resource._id ? (
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-bg/90 backdrop-blur-sm p-2 text-center"
                      >
                        <p className="text-xs text-text">Delete this resource?</p>
                        {deleteError && <p className="text-[10px] text-error">{deleteError}</p>}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmingDeleteId(null);
                              setDeleteError(null);
                            }}
                            className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-muted hover:text-text transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleSingleDelete(resource._id, e)}
                            disabled={deletingId === resource._id}
                            className="flex items-center gap-1 rounded-md bg-error px-2 py-1 text-[11px] text-white hover:bg-error/90 disabled:opacity-60 transition-colors"
                          >
                            {deletingId === resource._id ? (
                              <LoaderCircle size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} strokeWidth={1.75} />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmingDeleteId(resource._id);
                          setDeleteError(null);
                        }}
                        className="absolute top-1.5 right-1.5 z-10 text-white/90 bg-black/50 hover:bg-error/80 rounded-md p-1 transition-colors"
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    )
                  )}

                    <div className="relative h-28 sm:h-32 lg:h-36 w-full bg-surface overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon size={28} strokeWidth={1.5} className="text-accent/60" />
                        </div>
                      )}
                      {resource.fileType === "video" && (
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                          {resource.duration ? `${Math.round(resource.duration)}s` : "video"}
                        </span>
                      )}
                    </div>

                      <div className="bg-surface px-2 py-1.5 border-t border-border">
                        <p className="text-xs font-medium text-text truncate">{resource.title}</p>
                        <p className="text-[10px] text-text-muted font-mono truncate">
                          {resource.uploader?.name}
                          {formatBytes(resource.fileSize) && ` · ${formatBytes(resource.fileSize)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors">Previous</button>
                  <span className="font-mono text-xs text-text-muted">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors">Next</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {modalIndex !== null && (
        <ResourceViewerModal
          items={previewableItems.map((r) => ({ title: r.title, fileType: r.fileType, url: modalUrls[r._id] }))}
          currentIndex={modalIndex}
          onClose={() => setModalIndex(null)}
          onNavigate={handleModalNavigate}
        />
      )}
    </div>
  );
}