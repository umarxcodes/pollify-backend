import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import connectDB from "./config/db.config.js";

import "./config/env.js";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import pollRoutes from "./modules/poll/poll.routes.js";
import voteRoutes from "./modules/vote/vote.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import bookmarkRoutes from "./modules/bookmark/bookmark.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import organizationRoutes from "./modules/organization/organization.routes.js";
import followRoutes from "./modules/follow/follow.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import {
  generateCsrfToken,
  setCsrfCookie,
  verifyCsrfToken,
} from "./middlewares/csrf.middleware.js";

const app = express();

// Vercel invokes the exported Express app directly, so server.js does not run
// its local startServer() database bootstrap there. Connect lazily before any
// database-backed API route; connectDB caches successful warm connections.
const ensureDatabaseConnection = async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
};

// HTTP request logging with correlation IDs
app.use(pinoHttp({ logger }));

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// CORS with strict origin allowlist from env
const corsOrigins = env.corsOrigins;
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token"],
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

// Response compression
app.use(compression());

// Body parsing with size limits to prevent payload attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Handle body parser errors
app.use((err, req, res, next) => {
  if (
    err &&
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }
  next(err);
});

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

app.get("/api/v1/csrf-token", (req, res) => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  res.status(200).json({ success: true, data: { csrfToken: token } });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pollify API is running successfully",
  });
});

// Feature routes
app.use("/api/v1/auth", ensureDatabaseConnection, authRoutes);
app.use("/api/v1/users", ensureDatabaseConnection, verifyCsrfToken, userRoutes);
app.use("/api/v1/polls", ensureDatabaseConnection, verifyCsrfToken, pollRoutes);
app.use("/api/v1/votes", ensureDatabaseConnection, verifyCsrfToken, voteRoutes);
app.use(
  "/api/v1/analytics",
  ensureDatabaseConnection,
  verifyCsrfToken,
  analyticsRoutes
);
app.use(
  "/api/v1/comments",
  ensureDatabaseConnection,
  verifyCsrfToken,
  commentRoutes
);
app.use(
  "/api/v1/bookmarks",
  ensureDatabaseConnection,
  verifyCsrfToken,
  bookmarkRoutes
);
app.use(
  "/api/v1/notifications",
  ensureDatabaseConnection,
  verifyCsrfToken,
  notificationRoutes
);
app.use("/api/v1/search", ensureDatabaseConnection, searchRoutes);
app.use(
  "/api/v1/reports",
  ensureDatabaseConnection,
  verifyCsrfToken,
  reportRoutes
);
app.use(
  "/api/v1/admin",
  ensureDatabaseConnection,
  verifyCsrfToken,
  adminRoutes
);
app.use(
  "/api/v1/organizations",
  ensureDatabaseConnection,
  verifyCsrfToken,
  organizationRoutes
);
app.use(
  "/api/v1/follow",
  ensureDatabaseConnection,
  verifyCsrfToken,
  followRoutes
);

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
