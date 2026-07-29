import User from "../../models/User.js";
import RefreshToken from "../../models/RefreshToken.js";
import PasswordResetToken from "../../models/PasswordResetToken.js";

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

  async findUserByIdWithPassword(id) {
    return User.findById(id).select("+password");
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

  async updateUserProfile(userId, updates) {
    return User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  async updatePassword(userId, password) {
    const user = await User.findById(userId).select("+password");
    if (!user) return null;
    user.password = password;
    await user.save();
    return user;
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

  // Delete all refresh tokens for a user
  async deleteRefreshTokensByUserId(userId) {
    return await RefreshToken.deleteMany({ userId });
  }

  async upsertPasswordResetToken(userId, hashedToken, expiresAt) {
    return PasswordResetToken.findOneAndUpdate(
      { userId },
      { $set: { hashedToken, expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async consumePasswordResetToken(hashedToken) {
    return PasswordResetToken.findOneAndDelete({
      hashedToken,
      expiresAt: { $gt: new Date() },
    });
  }

  async deletePasswordResetToken(userId) {
    return PasswordResetToken.deleteOne({ userId });
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
