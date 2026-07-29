import { mailService } from "./mail.service.js";
import { generateOTP } from "../utils/generateOTP.js";
import { hashOTP } from "../utils/otp.util.js";
import VerificationToken from "../models/VerificationToken.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

class OTPService {
  async sendVerificationOtp(userId, email, name) {
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
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const expiryText = `${env.otpExpiryMinutes} minute${env.otpExpiryMinutes === 1 ? "" : "s"}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb;">Verify Your Pollify Account</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Welcome to Pollify. Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${plainOtp}</p>
        <p>This OTP expires in ${expiryText}.</p>
        <p>If you didn't create this account, ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #888; font-size: 14px;">Regards,<br>Pollify Team</p>
      </div>
    `;

    await mailService.sendMail({
      to: email,
      subject: "Verify Your Pollify Account",
      text: `Your OTP is ${plainOtp}. It expires in ${expiryText}.`,
      html: htmlContent,
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
