import Follow from "../../models/Follow.js";

class FollowRepository {
  async createFollow(followerId, followingId) {
    return await Follow.create({ followerId, followingId });
  }

  async deleteFollow(followerId, followingId) {
    return await Follow.findOneAndDelete({ followerId, followingId });
  }

  async findFollow(followerId, followingId) {
    return await Follow.findOne({ followerId, followingId });
  }

  async getFollowers(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Follow.find({ followingId: userId })
      .populate("followerId", "name username profileImage isVerified")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getFollowing(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Follow.find({ followerId: userId })
      .populate("followingId", "name username profileImage isVerified")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async countFollowers(userId) {
    return await Follow.countDocuments({ followingId: userId });
  }

  async countFollowing(userId) {
    return await Follow.countDocuments({ followerId: userId });
  }

  async isFollowing(followerId, followingId) {
    return await Follow.exists({ followerId, followingId });
  }
}

export const followRepository = new FollowRepository();
