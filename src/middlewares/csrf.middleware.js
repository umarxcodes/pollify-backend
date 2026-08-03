import crypto from "node:crypto";
import { Response } from "../utils/response.js";
import { env } from "../config/env.js";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const setCsrfCookie = (res, token) => {
  const isProduction = env.nodeEnv === "production";
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.cookieSecure,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const verifyCsrfToken = (req, res, next) => {
  const method = req.method.toLowerCase();
  if (["get", "head", "options"].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (
    !cookieToken ||
    !headerToken ||
    typeof headerToken !== "string" ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return res.status(403).json(Response.fail(403, null, "Invalid CSRF token"));
  }

  next();
};
