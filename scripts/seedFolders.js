// scripts/seedFolders.js
import mongoose from "mongoose";
import Folder from "../src/models/Folder.js";

const folders = [
  { name: "Past Papers", slug: "past-papers" },
  { name: "Notes", slug: "notes" },
  { name: "PDFs", slug: "pdfs" },
  { name: "Results", slug: "results" },
  { name: "Videos", slug: "videos" },
  { name: "Links", slug: "links" },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const folder of folders) {
    await Folder.updateOne(
      { slug: folder.slug },
      { $setOnInsert: { ...folder, createdBy: new mongoose.Types.ObjectId() } },
      { upsert: true }
    );
  }

  console.log(`Done. Upserted ${folders.length} folders.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});