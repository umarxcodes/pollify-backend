import { env } from "../config/env.js";

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: env.jwt.refreshExpiryMs,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getAccessTokenFromCookies = (req) => {
  return req.cookies?.accessToken;
};

export const getRefreshTokenFromCookies = (req) => {
  return req.cookies?.refreshToken;
};
