import User from "../../models/User.js";

// Repository pattern: all database operations for the user domain
class UserRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  async findByUsername(username) {
    return await User.findOne({ username }).select("-password");
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select("-password");
  }

  async updateUser(userId, updates) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
  }

  async updatePassword(userId, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) return null;
    user.password = newPassword;
    await user.save();
    return user.toObject({ getters: false });
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  async getUserStats(userId) {
    return await User.aggregate([
      { $match: { _id: userId } },
      {
        $project: {
          createdAt: 1,
          profileCompletion: {
            $multiply: [
              {
                $add: [
                  { $cond: [{ $gt: [{ $strLenCP: "$name" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$bio" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$website" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$github" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$linkedin" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$twitter" }, 0] }, 10, 0] },
                  { $cond: [{ $gt: [{ $strLenCP: "$location" }, 0] }, 10, 0] },
                  { $cond: [{ $ne: ["$profileImage", ""] }, 20, 0] },
                ],
              },
              100,
            ],
          },
        },
      },
    ]);
  }
}

export const userRepository = new UserRepository();
