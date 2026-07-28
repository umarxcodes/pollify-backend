import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import requestId from "express-request-id";
import pinoHttp from "pino-http";
import mongoSanitize from "mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { env } from "./config/env.config.js";
import { healthRouter } from "./modules/health/health.router.js";
import { userRouter } from "./modules/user/user.router.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { logger } from "./utils/logger.js";

export const app = express();

// Request correlation
app.use(requestId());

// Structured logging
app.use(pinoHttp({ logger }));

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Trust proxy (for accurate IP behind load balancer/NGINX)
app.set("trust proxy", 1);

// CORS
const corsOrigin = env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigin.includes("*") || corsOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

// Body limit protection (prevent large payload DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Input sanitization (prevent NoSQL injection in body/query)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// Health routes (no auth required)
app.use("/health", healthRouter);
app.use("/ready", healthRouter);

// Feature routers will be mounted here once implemented, e.g.:
const apiBase = env.API_PREFIX
  ? `/${env.API_PREFIX.replace(/^\/|\/$/g, "")}`
  : "/api/v1";
app.use(apiBase, [authRouter, userRouter]);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);
