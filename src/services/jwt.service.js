import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const COMMON_SECRETS = new Set([
  "change_me_to_a_random_32_char_min_string_production",
  "change_me_to_another_random_32_char_min_string_production",
  "secret",
  "password",
  "123456",
  "jwt_secret",
  "access_secret",
  "refresh_secret",
]);

const requiredSecret = (secret, key) => {
  if (!secret || secret.length < 32) {
    throw new Error(
      `${key} must be set to a random value of at least 32 characters`
    );
  }

  if (COMMON_SECRETS.has(secret)) {
    throw new Error(
      `${key} must not be a common/placeholder value. Generate a secure random string.`
    );
  }

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
