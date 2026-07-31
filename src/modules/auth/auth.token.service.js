import { env } from "../../config/env.js";
import RefreshToken from "../../models/RefreshToken.js";
import {
  generateRefreshToken,
  verifyRefreshToken,
} from "../../services/jwt.service.js";
import { hashToken } from "../../utils/token.util.js";
import { ApiError } from "../../utils/apiError.js";

class AuthTokenService {
  async generateAndStoreRefreshToken(
    userId,
    deviceInfo = "",
    ipAddress = "",
    rememberMe = false
  ) {
    const refreshToken = generateRefreshToken({
      sub: userId.toString(),
      type: "refresh",
    });
    const expiresAt = new Date(
      Date.now() +
        (rememberMe ? 30 * 24 * 60 * 60 * 1000 : env.jwt.refreshExpiryMs)
    );

    await RefreshToken.create({
      userId,
      hashedToken: hashToken(refreshToken),
      expiresAt,
      device: deviceInfo.slice(0, 250),
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
    let payload;
    try {
      payload = verifyRefreshToken(oldPlainToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
    if (payload.type !== "refresh" || payload.sub !== userId.toString())
      throw new ApiError(401, "Invalid refresh token");

    const deleted = await RefreshToken.deleteOne({
      userId,
      hashedToken: hashToken(oldPlainToken),
      expiresAt: { $gt: new Date() },
    });
    if (deleted.deletedCount !== 1)
      throw new ApiError(401, "Invalid or expired refresh token");

    return this.generateAndStoreRefreshToken(userId, deviceInfo, ipAddress);
  }

  async revokeAllRefreshTokens(userId) {
    await RefreshToken.deleteMany({ userId });
  }

  async revokeRefreshToken(token) {
    try {
      const payload = verifyRefreshToken(token);
      await RefreshToken.deleteOne({
        userId: payload.sub,
        hashedToken: hashToken(token),
      });
    } catch {
      // Logout is intentionally idempotent and must not expose token validity.
    }
  }
}

export const authTokenService = new AuthTokenService();
