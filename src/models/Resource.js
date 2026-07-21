import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "image", "video", "link"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // B2 public/signed URL, or the external link itself
    },
    fileKey: {
      type: String, // B2 object key — needed later to delete the file from B2
      default: null, // null for external links, since there's nothing to delete on B2
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "published", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Search resources by title/description
resourceSchema.index({ title: "text", description: "text" });

// Fast filtering: "show all published resources for this course + folder"
resourceSchema.index({ course: 1, folder: 1, status: 1 });
resourceSchema.index({ teacher: 1, status: 1 });

export default mongoose.models.Resource || mongoose.model("Resource", resourceSchema);