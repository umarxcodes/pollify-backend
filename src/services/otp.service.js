import { mailService } from "./mail.service.js";
import { generateOTP } from "../utils/generateOTP.js";
import { hashOTP } from "../utils/otp.util.js";
import VerificationToken from "../models/VerificationToken.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import { verificationEmail } from "./mail.templates.js";

class OTPService {
  async sendVerificationOtp(userId, email, name, enforceCooldown = false) {
    const existing = await VerificationToken.findOne({ userId });
    if (
      enforceCooldown &&
      existing?.sentAt &&
      Date.now() - existing.sentAt.getTime() <
        env.otpResendCooldownSeconds * 1000
    ) {
      throw new ApiError(
        429,
        "Please wait before requesting another verification code"
      );
    }
    const plainOtp = generateOTP();
    const hashedOtp = await hashOTP(plainOtp);
    const otpExpiry = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

    const verificationToken = await VerificationToken.findOneAndUpdate(
      { userId },
      {
        $set: {
          hashedOtp,
          expiresAt: otpExpiry,
          attempts: 0,
          isUsed: false,
          sentAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const expiryText = `${env.otpExpiryMinutes} minute${env.otpExpiryMinutes === 1 ? "" : "s"}`;

    await mailService.sendMail({
      to: email,
      ...verificationEmail(name, plainOtp, expiryText),
    });

    return verificationToken;
  }

  async verifyVerificationOtp(userId, candidateOtp) {
    const token = await VerificationToken.findOne({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: env.otpMaxAttempts },
    });

    if (!token || !(await token.compareOtp(candidateOtp))) {
      if (token) {
        await VerificationToken.updateOne(
          { _id: token._id, attempts: { $lt: env.otpMaxAttempts } },
          { $inc: { attempts: 1 } }
        );
      }
      throw new ApiError(400, "Invalid or expired verification code");
    }

    const consumed = await VerificationToken.updateOne(
      { _id: token._id, isUsed: false },
      { $set: { isUsed: true } }
    );
    if (consumed.modifiedCount !== 1)
      throw new ApiError(400, "Invalid or expired verification code");

    return true;
  }
}

export const otpService = new OTPService();
