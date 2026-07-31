import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { authRepository } from "./auth.repository.js";
import { otpService } from "../../services/otp.service.js";
import { generateAccessToken } from "../../services/jwt.service.js";
import { authTokenService } from "./auth.token.service.js";
import { env } from "../../config/env.js";
import { generateSecureToken, hashToken } from "../../utils/token.util.js";
import { mailService } from "../../services/mail.service.js";
import {
  passwordChangedEmail,
  passwordResetEmail,
} from "../../services/mail.templates.js";
import { verifyRefreshToken } from "../../services/jwt.service.js";
import { CloudinaryService } from "../../services/cloudinary.service.js";

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
      const uploaded = await CloudinaryService.uploadImage(profileImage);
      userProfileImage = uploaded.url;
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
      await otpService.sendVerificationOtp(
        user._id,
        user.email,
        user.name,
        false
      );
    return Response.success(
      202,
      null,
      "If an unverified account exists, a verification code has been sent."
    );
  }

  // Login user with username/email and password
  async login({
    identifier,
    password,
    rememberMe: _rememberMe = false,
    ipAddress,
    userAgent,
  }) {
    const user = await authRepository.findUserByIdentifier(identifier);
    if (!user) {
      throw new ApiError(401, "Invalid username/email or password.");
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockedUntil) - new Date()) / 60000
      );
      throw new ApiError(
        423,
        `Account locked due to multiple failed attempts. Try again in ${remainingMinutes} minutes.`
      );
    }

    if (user.isSuspended) {
      throw new ApiError(403, "Account is suspended");
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ApiError(403, "Invalid username/email or password.");
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const updatedUser = await authRepository.incrementLoginAttempts(user._id);
      const attempts = updatedUser.loginAttempts || 0;
      if (attempts >= env.login.maxAttempts) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + env.login.lockMinutes);
        await authRepository.lockAccount(user._id, lockUntil);
        throw new ApiError(
          423,
          `Account locked due to ${env.login.maxAttempts} failed attempts. Try again in ${env.login.lockMinutes} minutes.`
        );
      }

      throw new ApiError(401, "Invalid username/email or password.");
    }

    // Reset login attempts on successful password check
    await authRepository.resetLoginAttempts(user._id);

    // Generate tokens
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = await authTokenService.generateAndStoreRefreshToken(
      user._id,
      userAgent || "",
      ipAddress || "",
      _rememberMe
    );

    // Update last login
    await authRepository.updateLoginActivity(
      user._id,
      ipAddress || "",
      userAgent || ""
    );

    // Prepare safe user response
    const safeUser = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    const response = Response.success(
      200,
      {
        user: safeUser,
        accessToken,
        refreshToken,
      },
      "Login successful."
    );

    return response;
  }

  async refresh(refreshToken, userAgent, ipAddress) {
    if (!refreshToken) throw new ApiError(401, "Refresh token is required");
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
    if (payload.type !== "refresh")
      throw new ApiError(401, "Invalid refresh token");
    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isVerified)
      throw new ApiError(401, "Invalid or expired refresh token");
    const newRefreshToken = await authTokenService.rotateRefreshToken(
      user._id,
      refreshToken,
      userAgent || "",
      ipAddress || ""
    );
    const accessToken = generateAccessToken({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    if (refreshToken) await authTokenService.revokeRefreshToken(refreshToken);
    return Response.success(200, null, "Logged out successfully");
  }

  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);
    if (user) {
      await authTokenService.revokeAllRefreshTokens(user._id);
      const token = generateSecureToken();
      await authRepository.upsertPasswordResetToken(
        user._id,
        hashToken(token),
        new Date(Date.now() + 15 * 60 * 1000)
      );
      const resetUrl = `${env.frontendUrl || "http://localhost:5173"}/reset-password?token=${token}`;
      await mailService.sendMail({
        to: user.email,
        ...passwordResetEmail(user.name, resetUrl),
      });
    }
    return Response.success(
      202,
      null,
      "If an account exists, password reset instructions have been sent."
    );
  }

  async resetPassword(token, password) {
    const resetToken = await authRepository.consumePasswordResetToken(
      hashToken(token)
    );
    if (!resetToken) throw new ApiError(400, "Invalid or expired reset token");
    const user = await authRepository.updatePassword(
      resetToken.userId,
      password
    );
    if (!user) throw new ApiError(400, "Invalid or expired reset token");
    await authRepository.deleteRefreshTokensByUserId(user._id);
    await mailService.sendMail({
      to: user.email,
      ...passwordChangedEmail(user.name),
    });
    return Response.success(200, null, "Password reset successfully");
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserByIdWithPassword(userId);
    if (!user || !(await user.comparePassword(currentPassword)))
      throw new ApiError(401, "Current password is incorrect");
    await authRepository.updatePassword(userId, newPassword);
    await authTokenService.revokeAllRefreshTokens(userId);
    await mailService.sendMail({
      to: user.email,
      ...passwordChangedEmail(user.name),
    });
    return Response.success(200, null, "Password changed successfully");
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return Response.success(200, { user: this.#publicUser(user) });
  }

  async updateProfile(userId, data, profileImage) {
    if (data.username) {
      const existing = await authRepository.findUserByUsername(data.username);
      if (existing && existing._id.toString() !== userId.toString())
        throw new ApiError(409, "Username is unavailable");
    }
    const updates = {};
    if (data.name) updates.name = data.name;
    if (data.username) updates.username = data.username;
    if (profileImage) {
      if (!this.#isSupportedImage(profileImage.buffer))
        throw new ApiError(
          400,
          "Profile image content must be jpg, png, or webp"
        );
      const uploaded = await CloudinaryService.uploadImage(profileImage);
      updates.profileImage = uploaded.url;
    }
    const user = await authRepository.updateUserProfile(userId, updates);
    return Response.success(
      200,
      { user: this.#publicUser(user) },
      "Profile updated successfully"
    );
  }

  #publicUser(user) {
    return {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
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
