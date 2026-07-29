import pino from "pino";

// Shared structured logger for the application
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export default logger;
