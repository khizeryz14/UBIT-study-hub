import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb.js";

const client = await clientPromise;
const db = client.db(); // uses the DB name from your connection string

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["member", "moderator", "admin"],
        defaultValue: "member",
        input: false,
      },
    },
  },
});