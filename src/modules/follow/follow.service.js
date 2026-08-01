import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { followRepository } from "./follow.repository.js";
import User from "../../models/User.js";

class FollowService {
  async followUser(followerId, followingId) {
    if (followerId.toString() === followingId.toString()) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    const existingFollow = await followRepository.findFollow(followerId, followingId);
    if (existingFollow) {
      throw new ApiError(409, "You are already following this user");
    }

    const follow = await followRepository.createFollow(followerId, followingId);

    return Response.success(201, { follow }, "User followed successfully");
  }

  async unfollowUser(followerId, followingId) {
    const existingFollow = await followRepository.findFollow(followerId, followingId);
    if (!existingFollow) {
      throw new ApiError(404, "You are not following this user");
    }

    await followRepository.deleteFollow(followerId, followingId);

    return Response.success(200, null, "User unfollowed successfully");
  }

  async getFollowers(userId, page = 1, limit = 20) {
    const followers = await followRepository.getFollowers(userId, page, limit);
    const total = await followRepository.countFollowers(userId);

    return Response.success(
      200,
      {
        users: followers.map((f) => f.followerId),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
        },
      },
      "Followers fetched successfully"
    );
  }

  async getFollowing(userId, page = 1, limit = 20) {
    const following = await followRepository.getFollowing(userId, page, limit);
    const total = await followRepository.countFollowing(userId);

    return Response.success(
      200,
      {
        users: following.map((f) => f.followingId),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
        },
      },
      "Following fetched successfully"
    );
  }

  async checkFollowStatus(followerId, followingId) {
    const isFollowing = await followRepository.isFollowing(followerId, followingId);
    return Response.success(200, { isFollowing: !!isFollowing }, "Follow status checked");
  }

  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const followersCount = await followRepository.countFollowers(userId);
    const followingCount = await followRepository.countFollowing(userId);

    return Response.success(
      200,
      {
        stats: {
          profileCompletionPercentage: 0,
          accountCreatedAt: user.createdAt,
          totalPollsCreated: 0,
          totalVotesCast: 0,
          totalComments: 0,
          totalSavedPolls: 0,
          totalLikesReceived: 0,
          followersCount,
          followingCount,
        },
      },
      "Account statistics fetched successfully"
    );
  }
}

export const followService = new FollowService();
