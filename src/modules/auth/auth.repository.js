import User from "../../models/User.js";

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
}

export const authRepository = new AuthRepository();
