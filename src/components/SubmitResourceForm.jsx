"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, LoaderCircle, Send, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const MIME_TO_CATEGORY = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "video/mp4": "video",
};

const CLIENT_MAX_SIZE = {
  "application/pdf": 500 * 1024 * 1024,
  "image/png": 20 * 1024 * 1024,
  "image/jpeg": 20 * 1024 * 1024,
  "video/mp4": 500 * 1024 * 1024,
};

export default function SubmitResourceForm({
  courseId,
  teacherId,
  folderId,
  onSuccess,
  onCancel,
}) {
  const { data: session } = useSession();

  const [mode, setMode] = useState("file"); // "file" | "link"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!teacherId || !folderId) {
      setError("Select a teacher and a folder before submitting.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Choose a file to upload.");
      return;
    }

    if (mode === "file" && file) {
      const limit = CLIENT_MAX_SIZE[file.type];
      if (limit && file.size > limit) {
        setError(`File too large. Max is ${Math.round(limit / 1024 / 1024)}MB.`);
        setLoading(false);
        return;
      }
    }

    if (mode === "link" && !linkUrl.trim()) {
      setError("Enter a link.");
      return;
    }

    setLoading(true);

    try {
      let fileType, fileUrl, fileKey;

      if (mode === "file") {
        const category = MIME_TO_CATEGORY[file.type];
        if (!category) {
          setError("Unsupported file type. Use PDF, PNG, JPG, or MP4.");
          setLoading(false);
          return;
        }

        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileMimeType: file.type,
            fileSize: file.size,
          }),
        });
        const presignData = await presignRes.json();
        if (!presignRes.ok) {
          setError(presignData.error || "Could not prepare upload.");
          setLoading(false);
          return;
        }

        const uploadRes = await fetch(presignData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) {
          setError("File upload to storage failed.");
          setLoading(false);
          return;
        }

        fileType = category;
        fileKey = presignData.fileKey;
        // Bucket is private — fileUrl is not directly browsable yet.
        // It's set to the storage key for now; a presigned GET URL is
        // generated on demand when a resource is actually opened.
        fileUrl = presignData.fileKey;
      } else {
        fileType = "link";
        fileUrl = linkUrl.trim();
        fileKey = null;
      }

      const createRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          course: courseId,
          teacher: teacherId,
          folder: folderId,
          fileType,
          fileUrl,
          fileKey,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || "Could not create resource.");
        setLoading(false);
        return;
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setLinkUrl("");
      setLoading(false);
      onSuccess?.(createData);
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  if (!session) return null;

  const willBeQueued = session.user.role === "member";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
          Submit a resource
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-muted hover:text-text transition-colors"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (e.g. Midterm 2023 - Section A)"
        className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
      />

      <div className="flex rounded-md border border-border overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
            mode === "file" ? "bg-accent text-bg" : "bg-surface-2 text-text-muted hover:text-text"
          }`}
        >
          <Upload size={14} strokeWidth={1.75} />
          File
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
            mode === "link" ? "bg-accent text-bg" : "bg-surface-2 text-text-muted hover:text-text"
          }`}
        >
          <LinkIcon size={14} strokeWidth={1.75} />
          Link
        </button>
      </div>

        {mode === "file" ? (
        <input
            key="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-text file:cursor-pointer"
        />
        ) : (
        <input
            key="link-input"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
        )}

      {willBeQueued && (
        <p className="text-xs text-text-muted">
          Your submission will be reviewed before it appears publicly.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md bg-accent py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Send size={16} strokeWidth={1.75} />
        )}
        Submit
      </button>
    </form>
  );
}