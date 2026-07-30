import mongoose from "mongoose";
import logger from "../utils/logger.js";

let isConnected = false;

// Establishes connection to MongoDB using the connection string from environment variables
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    // Do not exit the process directly; on serverless platforms like Vercel,
    // the runtime manages restarts. Throwing allows upstream error handling.
    throw error;
  }
};

export default connectDB;
