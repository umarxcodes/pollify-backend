import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.config.js";
import logger from "./utils/logger.js";

export default app;

const PORT = process.env.PORT || 5000;
let server = null;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

if (!process.env.VERCEL) {
  startServer();
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Rejection:", err);
    process.exit(1);
  });
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
  });
}
