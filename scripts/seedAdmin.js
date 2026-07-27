// scripts/seedAdmin.js
import { auth } from "../src/lib/auth.js";
import clientPromise from "../src/lib/mongodb.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME;

async function seedAdmin() {
  const client = await clientPromise;
  const db = client.db();

  const existing = await db.collection("user").findOne({ email: ADMIN_EMAIL });
  if (existing) {
    await db.collection("user").updateOne(
      { email: ADMIN_EMAIL },
      { $set: { role: "admin" } }
    );
    console.log("Existing user found — promoted to admin.");
    process.exit(0);
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  await db.collection("user").updateOne(
    { email: ADMIN_EMAIL },
    { $set: { role: "admin" } }
  );

  console.log("Admin user created and promoted:", result.user.email);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});