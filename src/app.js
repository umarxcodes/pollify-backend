import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";
import pinoHttp from "pino-http";
import pino from "pino";
import cookieParser from "cookie-parser";

import "./config/env.js";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import voteRoutes from "./modules/vote/vote.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import bookmarkRoutes from "./modules/bookmark/bookmark.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { verifyCsrfToken } from "./middlewares/csrf.middleware.js";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

const app = express();

// HTTP request logging with correlation IDs
app.use(pinoHttp({ logger }));

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// CORS with strict origin allowlist from env
const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin))
      return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

// Global rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Body parsing with size limits to prevent payload attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser for JWT token handling
app.use(cookieParser());

// NoSQL injection protection for all request sources
app.use((req, res, next) => {
  mongoSanitize(req.body);
  mongoSanitize(req.query);
  mongoSanitize(req.params);
  next();
});

// Health check endpoint for load balancers
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pollify API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pollify API is running successfully",
  });
});

// Feature routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", verifyCsrfToken, userRoutes);
app.use("/api/v1/votes", verifyCsrfToken, voteRoutes);
app.use("/api/v1/analytics", verifyCsrfToken, analyticsRoutes);
app.use("/api/v1/comments", verifyCsrfToken, commentRoutes);
app.use("/api/v1/bookmarks", verifyCsrfToken, bookmarkRoutes);
app.use("/api/v1/notifications", verifyCsrfToken, notificationRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/reports", verifyCsrfToken, reportRoutes);
app.use("/api/v1/admin", verifyCsrfToken, adminRoutes);

// Multer file upload error handler
app.use((error, req, res, next) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File size too large. Maximum allowed size is 2MB.",
    });
  }

  if (error?.message?.includes("Invalid profile image type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

// 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler (must be registered last)
app.use(errorHandler);

export default app;
