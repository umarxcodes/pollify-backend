import mongoose from "mongoose";
import logger from "../utils/logger.js";

let connectionPromise = null;

// Establishes connection to MongoDB using the connection string from environment variables
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 })
    .then(() => logger.info("MongoDB connected successfully"))
    .catch((error) => {
      connectionPromise = null;
      logger.error("MongoDB connection failed:", error);
      throw error;
    });

  return connectionPromise;
};

export default connectDB;
