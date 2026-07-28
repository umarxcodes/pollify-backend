import mongoose from "mongoose";
import { env } from "./env.config.js";
import { logger } from "../utils/logger.js";

const CONNECT_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

export const connectDB = async () => {
  let retries = 0;
  while (retries < CONNECT_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.NODE_ENV === "test" ? "test" : undefined,
      });
      logger.info("MongoDB connected successfully");
      return;
    } catch (error) {
      retries++;
      logger.error({ err: error, retry: retries }, "MongoDB connection failed");
      if (retries >= CONNECT_RETRIES) {
        throw new Error("Failed to connect to MongoDB after maximum retries", {
          cause: error,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB connection error");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected gracefully");
};
