import { config } from "dotenv";
import app from "./app.js";
import { connectDB } from "../config/db.js";

config();

const PORT = process.env.PORT || 5000;

// ******************************
// Connect to Database
// ---------------------
connectDB();

if (process.env.NODE_ENV !== "production") {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// *****************************
// Unhandled Promise Rejection & Uncaught Exception Handling
// ---------------------

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  app.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// Export the app for Vercel
export default app;
