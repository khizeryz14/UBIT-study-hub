import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Better Auth's user collection lives outside Mongoose (native driver),
    // so we store the id as a plain ObjectId with no `ref` — we'll manually
    // look up the user via the native client when we need their details.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

// Same teacher name can exist under different courses, but not duplicated
// within the same course
teacherSchema.index({ course: 1, name: 1 }, { unique: true });

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);