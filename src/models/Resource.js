import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    baseTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
    fileType: { type: String, enum: ["pdf", "image", "video", "doc", "sheet", "slides", "text", "link"], required: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, default: null },
    thumbKey: { type: String, default: null },
    fileSize: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    duration: { type: Number, default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, default: null },
    groupIndex: { type: Number, default: 1 },
    groupTotal: { type: Number, default: 1 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ["pending", "published", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text", description: "text" });
resourceSchema.index({ course: 1, folder: 1, status: 1 });
resourceSchema.index({ teacher: 1, status: 1 });
resourceSchema.index({ groupId: 1 });

export default mongoose.models.Resource || mongoose.model("Resource", resourceSchema);