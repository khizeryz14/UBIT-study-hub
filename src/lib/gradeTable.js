// Fixed grade table per your university's grading policy.
const GRADE_TABLE = [
  { min: 90, letter: "A+", point: 4.0 },
  { min: 85, letter: "A", point: 4.0 },
  { min: 80, letter: "A-", point: 3.8 },
  { min: 75, letter: "B+", point: 3.4 },
  { min: 71, letter: "B", point: 3.0 },
  { min: 68, letter: "B-", point: 2.8 },
  { min: 64, letter: "C+", point: 2.4 },
  { min: 61, letter: "C", point: 2.0 },
  { min: 57, letter: "C-", point: 1.8 },
  { min: 53, letter: "D+", point: 1.4 },
  { min: 45, letter: "D", point: 1.0 },
  { min: 0, letter: "F", point: 0.0 },
];

export function getGradeForMarks(marks) {
  if (marks === null || marks === undefined || isNaN(marks)) return null;
  const entry = GRADE_TABLE.find((e) => marks >= e.min);
  return entry ? { gradePoint: entry.point, letterGrade: entry.letter } : null;
}

// Color buckets for grade points (0.0–4.0 scale). Thresholds:
// red < 2.0 (C and below) · yellow 2.0–2.79 (C+ to B-) ·
// light green 2.8–3.59 (B to A-) · green >= 3.6 (A and above)
export function getGradeColors(value) {
  if (value === null || value === undefined) {
    return { text: "text-text-muted", bg: "bg-surface-2", border: "border-border" };
  }
  if (value < 2.0) return { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" };
  if (value < 2.8) return { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" };
  if (value < 3.6) return { text: "text-lime-400", bg: "bg-lime-400/10", border: "border-lime-400/30" };
  return { text: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" };
}