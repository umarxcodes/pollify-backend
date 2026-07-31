import dotenv from "dotenv";

dotenv.config();

// Parse integer env vars with a fallback default
const integer = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Centralized, validated environment config
export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: integer(process.env.PORT, 5000),
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  bcryptSaltRounds: integer(process.env.BCRYPT_SALT_ROUNDS, 12),
  otpSaltRounds: integer(process.env.OTP_SALT_ROUNDS, 10),
  otpExpiryMinutes: integer(process.env.OTP_EXPIRY_IN_MINUTES, 10),
  otpMaxAttempts: integer(process.env.OTP_MAX_ATTEMPTS, 5),
  otpResendCooldownSeconds: integer(
    process.env.OTP_RESEND_COOLDOWN_SECONDS,
    60
  ),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    refreshExpiryMs: 7 * 24 * 60 * 60 * 1000,
  },
  frontendUrl: process.env.FRONTEND_URL,
  cookieSecure:
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production",
  login: {
    maxAttempts: integer(process.env.LOGIN_MAX_ATTEMPTS, 5),
    lockMinutes: integer(process.env.LOGIN_LOCK_MINUTES, 15),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: integer(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  defaultAvatarUrl:
    process.env.DEFAULT_AVATAR_URL ||
    "https://res.cloudinary.com/dlul8f6xz/image/upload/v1/default_avatar",
});
