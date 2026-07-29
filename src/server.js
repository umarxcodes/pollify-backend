import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.config.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

// Bootstrap server with graceful shutdown and error handling
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
      );
    });

    // Graceful shutdown on SIGTERM/SIGINT
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully.`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });

      // Force shutdown if graceful close takes too long
      setTimeout(() => {
        logger.error("Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Catch unhandled promise rejections to prevent silent crashes
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Catch uncaught exceptions to log stack traces before exit
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
