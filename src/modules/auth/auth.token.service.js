import bcrypt from "bcrypt";
import { env } from "../../config/env.js";
import RefreshToken from "../../models/RefreshToken.js";

class AuthTokenService {
  async generateAndStoreRefreshToken(userId, deviceInfo = "", ipAddress = "") {
    const from = "node:crypto";
    const { randomBytes } = await import(from);
    const refreshToken = randomBytes(48).toString("hex");

    const hashedToken = await bcrypt.hash(refreshToken, env.otpSaltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId,
      hashedRefreshToken: hashedToken,
      expiresAt,
      deviceInfo,
      ipAddress,
    });

    return refreshToken;
  }

  async rotateRefreshToken(
    userId,
    oldPlainToken,
    deviceInfo = "",
    ipAddress = ""
  ) {
    const tokenDoc = await RefreshToken.findOne({ userId });
    if (!tokenDoc) {
      throw new Error("No refresh token found");
    }

    const isValid = await bcrypt.compare(
      oldPlainToken,
      tokenDoc.hashedRefreshToken
    );
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    await RefreshToken.deleteOne({ _id: tokenDoc._id });

    return this.generateAndStoreRefreshToken(userId, deviceInfo, ipAddress);
  }

  async revokeRefreshToken(userId) {
    await RefreshToken.deleteMany({ userId });
  }
}

export const authTokenService = new AuthTokenService();
