"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, LoaderCircle, Send, X, FileStack } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const MIME_TO_CATEGORY = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
  "application/vnd.ms-excel": "sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sheet",
  "text/csv": "sheet",
  "application/vnd.ms-powerpoint": "slides",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "slides",
  "text/plain": "text",
};
const MAX_SIZE = {
  pdf: 200 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  doc: 50 * 1024 * 1024,
  sheet: 50 * 1024 * 1024,
  slides: 50 * 1024 * 1024,
  text: 10 * 1024 * 1024,
};

function extractVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(2, video.duration / 2);
    };

    video.onseeked = () => {
      canvas.width = 480;
      canvas.height = (480 * video.videoHeight) / video.videoWidth;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          if (blob) resolve({ blob, duration: video.duration, width: video.videoWidth, height: video.videoHeight });
          else reject(new Error("Thumbnail extraction failed"));
        },
        "image/jpeg",
        0.8
      );
    };

    video.onerror = () => reject(new Error("Failed to load video"));
  });
}

function getImageThumbAndDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 480 / img.naturalWidth);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve({ blob, width: img.naturalWidth, height: img.naturalHeight }),
        "image/jpeg",
        0.82
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function SubmitResourceForm({ courseId, teacherId, folderId, onSuccess, onCancel }) {
  const { data: session } = useSession();

  const [mode, setMode] = useState("file");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 20) {
      setError("Max 20 files per submission.");
      return;
    }
    setError("");
    setFiles(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!teacherId || !folderId) {
      setError("Select a teacher and a folder before submitting.");
      return;
    }
    if (mode === "file" && files.length === 0) {
      setError("Choose at least one file.");
      return;
    }
    if (mode === "link" && !linkUrl.trim()) {
      setError("Enter a link.");
      return;
    }

    setLoading(true);

    try {
      let items = [];

      if (mode === "file") {
        for (const file of files) {
          const category = MIME_TO_CATEGORY[file.type];
          if (!category) {
            setError(`Unsupported file type: ${file.name}`);
            setLoading(false);
            return;
          }
          if (file.size > MAX_SIZE[category]) {
            setError(`${file.name} is too large (max ${Math.round(MAX_SIZE[category] / 1024 / 1024)}MB).`);
            setLoading(false);
            return;
          }
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const category = MIME_TO_CATEGORY[file.type];
          setProgress(`Preparing ${i + 1} of ${files.length}...`);

          let thumbBlob = null, width = null, height = null, duration = null;

          if (category === "video") {
            const result = await extractVideoThumbnail(file);
            console.log("Video thumbnail extracted:", result.blob.size, "bytes", result.width, result.height);
            thumbBlob = result.blob;
            width = result.width;
            height = result.height;
            duration = result.duration;
          } else if (category === "image") {
            const result = await getImageThumbAndDimensions(file);
            thumbBlob = result.blob;
            width = result.width;
            height = result.height;
          }

          setProgress(`Uploading ${i + 1} of ${files.length}...`);

          const presignRes = await fetch("/api/upload/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileMimeType: file.type,
              fileSize: file.size,
              hasThumb: !!thumbBlob,
              thumbMimeType: "image/jpeg",
            }),
          });
          const presignData = await presignRes.json();
          if (!presignRes.ok) {
            setError(presignData.error || `Could not prepare upload for ${file.name}.`);
            setLoading(false);
            return;
          }

          const uploadRes = await fetch(presignData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadRes.ok) {
            setError(`Upload failed for ${file.name}.`);
            setLoading(false);
            return;
          }

          if (thumbBlob && presignData.thumbUploadUrl) {
            const thumbUploadRes = await fetch(presignData.thumbUploadUrl, {
              method: "PUT",
              headers: { "Content-Type": "image/jpeg" },
              body: thumbBlob,
            });
            console.log("Thumb upload status:", thumbUploadRes.status, thumbUploadRes.ok);
          }

          items.push({
            fileType: category,
            fileUrl: presignData.fileKey,
            fileKey: presignData.fileKey,
            thumbKey: presignData.thumbKey || null,
            fileSize: file.size,
            width, height, duration,
          });
        }
      } else {
        items = [{ fileType: "link", fileUrl: linkUrl.trim(), fileKey: null, fileSize: null }];
      }

      setProgress("Saving...");
      const createRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, course: courseId, teacher: teacherId, folder: folderId, items }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || "Could not create resource.");
        setLoading(false);
        return;
      }

      setTitle(""); setDescription(""); setFiles([]); setLinkUrl(""); setLoading(false); setProgress("");
      onSuccess?.(createData);
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
      setProgress("");
    }
  }

  if (!session) return null;
  const willBeQueued = session.user.role === "member";

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">Submit a resource</p>
        <button type="button" onClick={onCancel} className="text-text-muted hover:text-text transition-colors">
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
      )}

      <input
        type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (e.g. Midterm 2023 - Section A)"
        className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />

      <textarea
        value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)" rows={2}
        className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
      />

      <div className="flex rounded-md border border-border overflow-hidden w-fit">
        <button type="button" onClick={() => setMode("file")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${mode === "file" ? "bg-accent text-bg" : "bg-surface-2 text-text-muted hover:text-text"}`}>
          <Upload size={14} strokeWidth={1.75} /> File(s)
        </button>
        <button type="button" onClick={() => setMode("link")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${mode === "link" ? "bg-accent text-bg" : "bg-surface-2 text-text-muted hover:text-text"}`}>
          <LinkIcon size={14} strokeWidth={1.75} /> Link
        </button>
      </div>

      {mode === "file" ? (
        <>
        <input
          key="file-input" type="file" multiple
          accept=".pdf,.png,.jpg,.jpeg,.mp4,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.webp"
          onChange={handleFileSelect}
          className="w-full text-sm text-text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-text file:cursor-pointer"
        />
          {files.length > 1 && (
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <FileStack size={13} strokeWidth={1.75} />
              {files.length} files — will be saved as &ldquo;{title || "Title"}-1&rdquo; through &ldquo;{title || "Title"}-{files.length}&rdquo;
            </p>
          )}
        </>
      ) : (
        <input
          key="link-input" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      )}

      {willBeQueued && (
        <p className="text-xs text-text-muted">Your submission will be reviewed before it appears publicly.</p>
      )}

      <button type="submit" disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md bg-accent py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60 transition-colors">
        {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} strokeWidth={1.75} />}
        {loading ? progress || "Submitting..." : "Submit"}
      </button>
    </form>
  );
}