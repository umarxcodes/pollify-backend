import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { env } from "./config/env.config.js";
import { logger } from "./utils/logger.js";

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });

    const gracefulShutdown = () => {
      logger.info("SIGTERM/SIGINT received, shutting down gracefully");
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDB();
        logger.info("Graceful shutdown complete");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    process.on("unhandledRejection", (err) => {
      logger.error({ err }, "Unhandled promise rejection");
      gracefulShutdown();
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
