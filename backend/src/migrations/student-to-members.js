/**
 * Migration: Convert Project.student (singular) → Project.members[] + Project.createdBy
 *
 * Run once after deploying the new schema:
 *   node --experimental-modules src/migrations/student-to-members.js
 *
 * Safe to re-run — it skips projects that already have members populated.
 */
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { config } from "dotenv";
import { connectDB } from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../.env") });

const migrate = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const projectsColl = db.collection("projects");

    // Find all projects that still have the old `student` field and do NOT
    // yet have `members` populated (or members is empty).
    const cursor = projectsColl.find({
      student: { $exists: true, $ne: null },
      $or: [
        { members: { $exists: false } },
        { members: { $size: 0 } },
        { members: null },
      ],
    });

    let migrated = 0;
    for await (const doc of cursor) {
      await projectsColl.updateOne(
        { _id: doc._id },
        {
          $set: {
            members: [doc.student],
            createdBy: doc.student,
            maxMembers: 2,
          },
          $unset: { student: "" },
        },
      );
      migrated++;
    }

    console.log(`Migration complete. ${migrated} project(s) updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
