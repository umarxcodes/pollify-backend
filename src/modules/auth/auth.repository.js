import User from "../../models/User.js";
import RefreshToken from "../../models/RefreshToken.js";

// Repository pattern: all database operations for the auth domain
class AuthRepository {
  // Find a user by unique username
  async findUserByUsername(username) {
    return await User.findOne({ username });
  }

  // Find a user by unique email
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  // Find a user by username or email
  async findUserByIdentifier(identifier) {
    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { username: identifier };
    return await User.findOne(query).select("+password");
  }

  // Find a user by MongoDB _id
  async findUserById(id) {
    return await User.findById(id);
  }

  // Create a new user document
  async createUser(userData) {
    const user = await User.create(userData);
    return user.toObject({ getters: false });
  }

  // Update user verification status
  async updateUserVerification(userId, isVerified) {
    return await User.findByIdAndUpdate(
      userId,
      { isVerified },
      {
        new: true,
        select: "-password",
      }
    );
  }

  // Update last login timestamp and activity log
  async updateLoginActivity(userId, ipAddress, userAgent) {
    return await User.findByIdAndUpdate(
      userId,
      {
        lastLogin: new Date(),
        loginActivity: {
          $push: {
            timestamp: new Date(),
            ipAddress,
            userAgent,
          },
        },
      },
      { new: true, select: "-password" }
    );
  }

  // Store refresh token
  async createRefreshToken(tokenData) {
    return await RefreshToken.create(tokenData);
  }

  // Find refresh token by hashed token
  async findRefreshToken(hashedToken) {
    const tokens = await RefreshToken.find({});
    for (const token of tokens) {
      const isValid = await token.compareRefreshToken?.(hashedToken);
      if (isValid) return token;
    }
    return null;
  }

  // Find refresh token by userId
  async findRefreshTokenByUserId(userId) {
    return await RefreshToken.findOne({ userId });
  }

  // Delete refresh token
  async deleteRefreshToken(tokenId) {
    return await RefreshToken.deleteOne({ _id: tokenId });
  }

  // Delete all refresh tokens for a user
  async deleteRefreshTokensByUserId(userId) {
    return await RefreshToken.deleteMany({ userId });
  }

  // Increment failed login attempts
  async incrementLoginAttempts(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $inc: { loginAttempts: 1 },
        lastFailedLogin: new Date(),
      },
      { new: true }
    );
  }

  // Reset login attempts
  async resetLoginAttempts(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $unset: { loginAttempts: 1, lockedUntil: 1 },
      },
      { new: true }
    );
  }

  // Lock account
  async lockAccount(userId, lockedUntil) {
    return await User.findByIdAndUpdate(userId, { lockedUntil }, { new: true });
  }
}

export const authRepository = new AuthRepository();
