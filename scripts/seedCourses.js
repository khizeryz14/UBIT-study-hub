import mongoose from "mongoose";
import Course from "../src/models/Course.js";

const courses = [
  // ───────── CS-XXX (New Curriculum) ─────────
  // Semester 1
  { code: "CS-351", title: "Programming Fundamentals", semester: 1, creditHours: 4, curriculum: "CS" },
  { code: "CS-353", title: "Introduction to Information & Communication Technologies", semester: 1, creditHours: 3, curriculum: "CS" },
  { code: "CS-355", title: "Calculus and Analytical Geometry", semester: 1, creditHours: 3, curriculum: "CS" },
  { code: "CS-357", title: "Applied Physics", semester: 1, creditHours: 3, curriculum: "CS" },
  { code: "CS-359", title: "Functional English", semester: 1, creditHours: 3, curriculum: "CS" },
  { code: "CS-361", title: "Islamic Studies or Ethics", semester: 1, creditHours: 2, curriculum: "CS" },
  { code: "CS-363", title: "Pakistan Studies", semester: 1, creditHours: 2, curriculum: "CS" },

  // Semester 2
  { code: "CS-352", title: "Object Oriented Concepts & Programming", semester: 2, creditHours: 4, curriculum: "CS" },
  { code: "CS-354", title: "Digital Logic Design", semester: 2, creditHours: 4, curriculum: "CS" },
  { code: "CS-356", title: "Linear Algebra", semester: 2, creditHours: 3, curriculum: "CS" },
  { code: "CS-358", title: "Discrete Structures", semester: 2, creditHours: 3, curriculum: "CS" },
  { code: "CS-362", title: "Ideology and Constitution of Pakistan", semester: 2, creditHours: 2, curriculum: "CS" },
  { code: "CS-364", title: "Fehm-e-Quran", semester: 2, creditHours: 2, curriculum: "CS" },

  // Semester 3
  { code: "CS-451", title: "Data Structures and Applications", semester: 3, creditHours: 4, curriculum: "CS" },
  { code: "CS-453", title: "Software Engineering Fundamentals", semester: 3, creditHours: 3, curriculum: "CS" },
  { code: "CS-455", title: "Computer Organization & Assembly Language", semester: 3, creditHours: 3, curriculum: "CS" },
  { code: "CS-457", title: "Multivariable Calculus", semester: 3, creditHours: 3, curriculum: "CS" },
  { code: "CS-459", title: "Probability & Statistics", semester: 3, creditHours: 3, curriculum: "CS" },
  { code: "CS-461", title: "Urdu", semester: 3, creditHours: 2, curriculum: "CS" },

  // Semester 4
  { code: "CS-452", title: "Database Management Systems", semester: 4, creditHours: 4, curriculum: "CS" },
  { code: "CS-454", title: "Expository Writing", semester: 4, creditHours: 3, curriculum: "CS" },
  { code: "CS-456", title: "Theory of Automata", semester: 4, creditHours: 3, curriculum: "CS" },
  { code: "CS-458", title: "Software Project Management", semester: 4, creditHours: 3, curriculum: "CS" },
  { code: "CS-460", title: "Data Communication and Networking", semester: 4, creditHours: 3, curriculum: "CS" },
  { code: "CS-462", title: "Professional Practices", semester: 4, creditHours: 3, curriculum: "CS" },

  // Semester 5
  { code: "CS-551", title: "Artificial Intelligence", semester: 5, creditHours: 3, curriculum: "CS" },
  { code: "CS-553", title: "Operating Systems", semester: 5, creditHours: 4, curriculum: "CS" },
  { code: "CS-555", title: "HCI and Computer Graphics", semester: 5, creditHours: 3, curriculum: "CS" },
  { code: "CS-557", title: "Information Security", semester: 5, creditHours: 3, curriculum: "CS" },
  { code: "CS-559", title: "Civics and Community Engagement", semester: 5, creditHours: 2, curriculum: "CS" },
  { code: "CS-561", title: "Cloud Computing", semester: 5, creditHours: 3, curriculum: "CS" },

  // Semester 6 (fixed)
  { code: "CS-552", title: "Advance Database Management Systems", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-554", title: "Compiler Construction", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-556", title: "Design and Analysis of Algorithms", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-558", title: "Financial Accounting", semester: 6, creditHours: 3, curriculum: "CS" },

  // Semester 6 — Domain Elective pool 1/2 (2 of these 6 are taken)
  { code: "CS-572", title: "Advanced Programming (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-574", title: "Mobile Applications Development (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-575", title: "Web Technologies (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-576", title: "Multimedia Systems (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-577", title: "Simulation and Digital Twins (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },
  { code: "CS-578", title: "Object Oriented Analysis and Design (Domain Elective)", semester: 6, creditHours: 3, curriculum: "CS" },

  // Semester 7 (fixed)
  { code: "CS-651", title: "Parallel & Distributed Computing", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-653", title: "Entrepreneurship", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-655", title: "Final Year Project - I", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-657", title: "Internship", semester: 7, creditHours: 3, curriculum: "CS" },

  // Semester 8 (fixed)
  { code: "CS-654", title: "Professional Certification", semester: 8, creditHours: 3, curriculum: "CS" },
  { code: "CS-656", title: "Final Year Project - II", semester: 8, creditHours: 3, curriculum: "CS" },

  // Semester 7/8 — Domain Elective pool 3/4/5 (3 of these 8 are taken; exact
  // semester split unconfirmed — placed at 7, verify/correct via admin UI)
  { code: "CS-671", title: "Software Testing & Quality Assurance (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-672", title: "Advanced Computer Graphics (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-673", title: "Cyber Security (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-674", title: "Data Science (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-675", title: "Data Warehousing and Data Mining (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-677", title: "Web Engineering (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-678", title: "Natural Language Processing (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },
  { code: "CS-679", title: "Neural Networks and Fuzzy Logic (Domain Elective)", semester: 7, creditHours: 3, curriculum: "CS" },

  // ───────── BSCS-XXX (Old Curriculum) ─────────
  // Year 1 (300 level)
  { code: "BSCS-301", title: "Introduction to Computer Science - I", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-302", title: "Introduction to Computer Science - II", semester: 2, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-303", title: "Mathematics - I (Calculus)", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-304", title: "Mathematics - II (Differential Equations)", semester: 2, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-305", title: "Statistics and Data Analysis", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-306", title: "Probability and Statistical Methods", semester: 2, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-307", title: "Physics - I (General Physics)", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-308", title: "Physics - II (Electricity and Magnetism)", semester: 2, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-309", title: "English - I", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-310", title: "English - II", semester: 2, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-311", title: "Islamic Learning & Pakistan Studies", semester: 1, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-312", title: "Urdu", semester: 2, creditHours: 3, curriculum: "BSCS" },

  // Year 2 (400 level)
  { code: "BSCS-401", title: "Digital Computer Design Fundamentals", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-402", title: "Data Structure", semester: 4, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-403", title: "Assembly Language Programming", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-404", title: "System Design with Microprocessor", semester: 4, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-405", title: "Mathematics - III (Linear Algebra and Analytical Geometry)", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-406", title: "Mathematics (Numerical Analysis and Computing)", semester: 4, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-407", title: "Communication Skills and Report Writing", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-408", title: "Object Oriented Programming", semester: 4, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-409", title: "Materials, Semiconductors and Devices", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-410", title: "Electronics", semester: 4, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-411", title: "Discrete Mathematics", semester: 3, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-412", title: "Software Engineering and Project Management", semester: 4, creditHours: 3, curriculum: "BSCS" },

  // Year 3 (500 level)
  { code: "BSCS-501", title: "Theory of Computer Science", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-502", title: "Concepts of Operating Systems", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-503", title: "Data Communication and Networking - I", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-504", title: "Compiler Construction - I", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-505", title: "Stochastic Process and Inference", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-506", title: "Modeling and Simulation", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-507", title: "Operations Research - I", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-508", title: "Operations Research - II", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-509", title: "Database Systems", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-510", title: "Microcomputer Design and Interfacing - I", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-511", title: "Computer Organization and Architecture", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-512", title: "Data Communication and Networking - II", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-513", title: "Advanced Numerical Computing", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-514", title: "Computer Graphics", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-515", title: "Artificial Intelligence", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-517", title: "System Analysis & Design", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-519", title: "Business Programming Languages", semester: 5, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-520", title: "Advanced Software Engineering", semester: 6, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-522", title: "Expert Systems", semester: 6, creditHours: 3, curriculum: "BSCS" },

  // Year 4 (600 level)
  { code: "BSCS-601", title: "Theory of Operating Systems", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-602", title: "Operating Systems Case Study", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-603", title: "Compiler Construction - II", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-604", title: "Natural Language Processing", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-605", title: "Advanced Computer Graphics", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-606", title: "Distributed Database Systems", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-607", title: "Financial Accounting", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-609", title: "Microcomputers Design and Interfacing - II", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-610", title: "Design and Analysis of Algorithms", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-611", title: "Parallel Computing", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-612", title: "Financial Management", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-613", title: "Management Information Systems", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-616", title: "Multimedia Systems", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-618", title: "Computational Linear Algebra", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-619", title: "Thesis - I", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-620", title: "Thesis - II", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-621", title: "Topics of Current/Special Interest", semester: 7, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-624", title: "Project (FYP)", semester: 8, creditHours: 3, curriculum: "BSCS" },
  { code: "BSCS-625", title: "VLSI Design Techniques", semester: 7, creditHours: 3, curriculum: "BSCS" },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Seeding courses...");

  for (const course of courses) {
    await Course.updateOne(
      { code: course.code },
      { $setOnInsert: course },
      { upsert: true }
    );
  }

  console.log(`Done. Upserted ${courses.length} courses.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});