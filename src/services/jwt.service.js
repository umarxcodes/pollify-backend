import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const requiredSecret = (secret, key) => {
  if (!secret || secret.length < 32)
    throw new Error(
      `${key} must be set to a random value of at least 32 characters`
    );
  return secret;
};

export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    requiredSecret(env.jwt.accessSecret, "JWT_ACCESS_SECRET"),
    {
      expiresIn: env.jwt.accessExpiry,
    }
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    requiredSecret(env.jwt.refreshSecret, "JWT_REFRESH_SECRET"),
    {
      expiresIn: env.jwt.refreshExpiry,
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    requiredSecret(env.jwt.accessSecret, "JWT_ACCESS_SECRET")
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    requiredSecret(env.jwt.refreshSecret, "JWT_REFRESH_SECRET")
  );
};
