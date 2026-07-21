import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // e.g. "CS-201"
    },
    curriculum: {
      type: String,
      enum: ["CS", "BSCS"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    creditHours: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

// Text index so title/code/description are searchable together
courseSchema.index({ code: "text", title: "text", description: "text" });

// Fast sort/filter by semester on the browse page
courseSchema.index({ curriculum: 1, semester: 1 });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);