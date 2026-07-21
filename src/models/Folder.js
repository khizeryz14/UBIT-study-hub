import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g. "Past Papers", "Notes", "Results"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // e.g. "past-papers" — used in filters/URLs
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Folder || mongoose.model("Folder", folderSchema);