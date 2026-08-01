import { followService } from "./follow.service.js";

class FollowController {
  static async followUser(req, res, next) {
    try {
      const result = await followService.followUser(req.user.id, req.params.userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unfollowUser(req, res, next) {
    try {
      const result = await followService.unfollowUser(req.user.id, req.params.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getFollowers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await followService.getFollowers(req.params.userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getFollowing(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await followService.getFollowing(req.params.userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async checkFollowStatus(req, res, next) {
    try {
      const result = await followService.checkFollowStatus(req.user.id, req.params.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default FollowController;
