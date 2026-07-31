import pino from "pino";

const sensitiveFields = [
  "password",
  "token",
  "otp",
  "accessToken",
  "refreshToken",
  "hashedOtp",
  "hashedToken",
  "secret",
  "apiKey",
  "api_secret",
];

const redactSensitiveFields = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const redacted = { ...obj };
  for (const field of sensitiveFields) {
    if (redacted[field] !== undefined) {
      redacted[field] = "[REDACTED]";
    }
  }
  return redacted;
};

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      ...sensitiveFields,
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.token",
      "req.body.otp",
      "res.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },
  formatter: (log) => {
    if (log.req && log.req.body) {
      log.req.body = redactSensitiveFields(log.req.body);
    }
    if (log.res && log.res.body) {
      log.res.body = redactSensitiveFields(log.res.body);
    }
    return log;
  },
});

export default logger;
