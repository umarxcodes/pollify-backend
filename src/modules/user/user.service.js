import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import User from "../../models/User.js";
import { userRepository } from "./user.repository.js";
import { CloudinaryService } from "../../services/cloudinary.service.js";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dlul8f6xz/image/upload/v1/default_avatar";

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return Response.success(200, { user }, "Profile fetched successfully");
  }

  async getPublicProfile(username) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new ApiError(404, "User not found");
    const publicUser = user.toObject ? user.toObject() : user;
    delete publicUser.password;
    delete publicUser.email;
    delete publicUser.loginAttempts;
    delete publicUser.lockedUntil;
    return Response.success(
      200,
      { user: publicUser },
      "Public profile fetched successfully"
    );
  }

  async updateProfile(userId, data) {
    if (data.username) {
      const existing = await userRepository.findByUsername(data.username);
      if (existing && existing._id.toString() !== userId.toString()) {
        throw new ApiError(409, "Username already exists");
      }
    }

    const updates = { ...data };
    if (updates.fullName) {
      updates.name = updates.fullName;
      delete updates.fullName;
    }

    const user = await userRepository.updateUser(userId, updates);
    if (!user) throw new ApiError(404, "User not found");
    return Response.success(200, { user }, "Profile updated successfully");
  }

  async uploadProfileImage(userId, file) {
    if (!file) throw new ApiError(400, "Profile image is required");

    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.profileImage && user.profileImage !== DEFAULT_AVATAR) {
      const oldPublicId = this.extractPublicId(user.profileImage);
      await CloudinaryService.deleteImage(oldPublicId);
    }

    const uploadResult = await CloudinaryService.uploadImage(
      file,
      "pollify/profile-images"
    );
    const updatedUser = await userRepository.updateUser(userId, {
      profileImage: uploadResult.url,
    });

    return Response.success(
      200,
      { user: updatedUser },
      "Profile image uploaded successfully"
    );
  }

  async deleteProfileImage(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.profileImage && user.profileImage !== DEFAULT_AVATAR) {
      const publicId = this.extractPublicId(user.profileImage);
      await CloudinaryService.deleteImage(publicId);
    }

    const updatedUser = await userRepository.updateUser(userId, {
      profileImage: DEFAULT_AVATAR,
    });

    return Response.success(
      200,
      { user: updatedUser },
      "Profile image deleted successfully"
    );
  }

  async deleteAccount(userId, password) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    if (user.profileImage && user.profileImage !== DEFAULT_AVATAR) {
      const publicId = this.extractPublicId(user.profileImage);
      await CloudinaryService.deleteImage(publicId);
    }

    await userRepository.deleteUser(userId);
    return Response.success(200, null, "Account deleted successfully");
  }

  async getStats(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const stats = await userRepository.getUserStats(userId);
    const profileCompletion = stats[0]?.profileCompletion || 0;

    return Response.success(
      200,
      {
        stats: {
          profileCompletionPercentage: profileCompletion,
          accountCreatedAt: user.createdAt,
          // Placeholder stats for future poll/vote/comment modules
          totalPollsCreated: 0,
          totalVotesCast: 0,
          totalComments: 0,
          totalSavedPolls: 0,
          totalLikesReceived: 0,
        },
      },
      "Account statistics fetched successfully"
    );
  }

  extractPublicId(url) {
    if (!url) return null;
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const folderAndFile = parts.slice(uploadIndex + 2);
    const filename = folderAndFile[folderAndFile.length - 1];
    const publicId = filename.split(".")[0];
    const folder = folderAndFile.slice(0, -1).join("/");
    return folder ? `${folder}/${publicId}` : publicId;
  }
}

export const userService = new UserService();
