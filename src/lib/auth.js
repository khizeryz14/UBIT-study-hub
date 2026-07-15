import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb";

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
        type: "string",
        defaultValue: "member",
        input: false, // prevents users from setting their own role at signup — important!
      },
    },
  },
});