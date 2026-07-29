import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { authRepository } from "./auth.repository.js";
import { otpService } from "../../services/otp.service.js";

class AuthService {
  // Register a new user and trigger email verification
  async register(userData, profileImage = null) {
    if (profileImage && profileImage.size > 2 * 1024 * 1024) {
      throw new ApiError(
        413,
        "File size too large. Maximum allowed size is 2MB."
      );
    }

    const existingUser = await authRepository.findUserByUsername(
      userData.username
    );
    if (existingUser) {
      throw new ApiError(409, "Username already exists");
    }

    const existingEmail = await authRepository.findUserByEmail(userData.email);
    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }

    let userProfileImage =
      "https://res.cloudinary.com/dlul8f6xz/image/upload/v1/default_avatar";
    if (profileImage) {
      if (!this.#isSupportedImage(profileImage.buffer)) {
        throw new ApiError(
          400,
          "Profile image content must be jpg, png, or webp"
        );
      }
      const base64 = profileImage.buffer.toString("base64");
      const mimeType = profileImage.mimetype;
      const dataUri = `data:${mimeType};base64,${base64}`;
      userProfileImage = dataUri;
    }

    const user = await authRepository.createUser({
      name: userData.name,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      profileImage: userProfileImage,
    });

    await otpService.sendVerificationOtp(user._id, user.email, user.name);

    const safeUser = { ...user };
    delete safeUser.password;

    return Response.success(
      201,
      { user: safeUser },
      "Registration successful. Please verify your email using the OTP sent to your email."
    );
  }

  // Verify email using the OTP sent to the user
  async verifyEmail({ email, otp }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new ApiError(400, "Invalid or expired verification code");
    if (user.isVerified)
      return Response.success(200, null, "Email is already verified");

    await otpService.verifyVerificationOtp(user._id, otp);
    await authRepository.updateUserVerification(user._id, true);
    return Response.success(200, null, "Email verified successfully");
  }

  // Resend verification email if user is still unverified
  async resendVerificationEmail(email) {
    const user = await authRepository.findUserByEmail(email);
    if (user && !user.isVerified)
      await otpService.sendVerificationOtp(user._id, user.email, user.name);
    return Response.success(
      202,
      null,
      "If an unverified account exists, a verification code has been sent."
    );
  }

  // Validate image by magic bytes to prevent MIME type spoofing
  #isSupportedImage(buffer) {
    if (!Buffer.isBuffer(buffer)) return false;
    const isJpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
    const isPng =
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp =
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP";
    return isJpeg || isPng || isWebp;
  }
}

export const authService = new AuthService();
