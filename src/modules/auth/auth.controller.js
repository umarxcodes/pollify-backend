import { authService } from "./auth.service.js";

// Thin HTTP layer: delegates all business logic to AuthService
class AuthController {
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req.file);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const result = await authService.verifyEmail(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(req, res, next) {
    try {
      const result = await authService.resendVerificationEmail(req.body.email);
      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
