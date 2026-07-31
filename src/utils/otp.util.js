import bcrypt from "bcrypt";
import { env } from "../config/env.js";

// Hash a plaintext OTP using bcrypt before storing in DB
export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, env.otpSaltRounds);
};

// Compare a plaintext OTP candidate against the stored hash
export const verifyOTP = async (plainOtp, hashedOtp) => {
  return await bcrypt.compare(plainOtp, hashedOtp);
};
