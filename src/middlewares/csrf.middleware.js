import { Response } from "../utils/response.js";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export const generateCsrfToken = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : require("crypto").randomUUID();
};

export const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json(Response.fail(403, null, "Invalid CSRF token"));
  }

  next();
};
