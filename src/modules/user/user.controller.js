import { userService } from "./user.service.js";

class UserController {
  static async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfile(req, res, next) {
    try {
      const result = await userService.getPublicProfile(req.params.username);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfileImage(req, res, next) {
    try {
      const result = await userService.uploadProfileImage(
        req.user.id,
        req.file
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfileImage(req, res, next) {
    try {
      const result = await userService.deleteProfileImage(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const result = await userService.deleteAccount(
        req.user.id,
        req.body.password
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const result = await userService.getStats(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
