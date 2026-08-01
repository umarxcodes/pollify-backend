import app from "../src/app.js";
import connectDB from "../src/config/db.config.js";

// Vercel serverless entry point. Vercel invokes this function for every
// request, so establish the cached MongoDB connection before Express executes
// a database-backed controller.
export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch {
    return res.status(503).json({
      success: false,
      message: "Database connection is unavailable. Please try again shortly.",
    });
  }
}
