import crypto from "node:crypto";

// Generate a cryptographically secure 6-digit numeric OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};
