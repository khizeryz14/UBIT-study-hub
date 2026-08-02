import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    marks: { type: Number, min: 0, max: 100, default: null },
    gradePoint: { type: Number, default: null },
    letterGrade: { type: String, default: null },
  },
  { timestamps: true }
);

gradeSchema.index({ user: 1, course: 1 }, { unique: true });
gradeSchema.index({ user: 1, semester: 1 });

export default mongoose.models.Grade || mongoose.model("Grade", gradeSchema);