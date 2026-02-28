/**
 * Migration: Rename "Teacher" role to "Supervisor"
 *
 * This script updates all existing users with the role "Teacher" to "Supervisor"
 * in the MongoDB database. Run this migration ONCE after deploying the refactored code.
 *
 * Usage:
 *   node src/migrations/rename-teacher-to-supervisor.js
 *
 * Make sure your .env file (or environment variables) contains a valid MONGO_URI.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.\n");

    const db = mongoose.connection.db;

    // 1. Update user roles: "Teacher" → "Supervisor"
    const usersResult = await db
      .collection("users")
      .updateMany({ role: "Teacher" }, { $set: { role: "Supervisor" } });

    console.log(
      `Users collection: ${usersResult.modifiedCount} document(s) updated (role: "Teacher" → "Supervisor").`,
    );

    // 2. Check for any notification links referencing /teacher/ paths
    const notificationsResult = await db
      .collection("notifications")
      .find({ link: { $regex: /\/teacher\// } })
      .toArray();

    if (notificationsResult.length > 0) {
      let updatedCount = 0;
      for (const notification of notificationsResult) {
        const newLink = notification.link.replace(
          /\/teacher\//g,
          "/supervisor/",
        );
        await db
          .collection("notifications")
          .updateOne({ _id: notification._id }, { $set: { link: newLink } });
        updatedCount++;
      }
      console.log(
        `Notifications collection: ${updatedCount} document(s) updated (link paths: /teacher/ → /supervisor/).`,
      );
    } else {
      console.log(
        "Notifications collection: No documents with /teacher/ links found.",
      );
    }

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

migrate();
