import { authService } from "./auth.service.js";
import { setAuthCookies } from "../../utils/cookie.util.js";
import { clearAuthCookies } from "../../utils/cookie.util.js";
import { Response } from "../../utils/response.js";

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

  static async login(req, res, next) {
    try {
      const { identifier, password, rememberMe } = req.body;
      const result = await authService.login({
        identifier,
        password,
        rememberMe,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      if (result.data?.accessToken && result.data?.refreshToken) {
        setAuthCookies(res, result.data.accessToken, result.data.refreshToken);
      }

      const safeData = { ...result.data };
      delete safeData.refreshToken;
      res.status(200).json({ ...result, data: safeData });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const tokens = await authService.refresh(
        req.cookies?.refreshToken,
        req.get("user-agent"),
        req.ip
      );
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res
        .status(200)
        .json(
          Response.success(
            200,
            { accessToken: tokens.accessToken },
            "Token refreshed"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const result = await authService.logout(req.cookies?.refreshToken);
      clearAuthCookies(res);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      res.status(202).json(await authService.forgotPassword(req.body.email));
    } catch (error) {
      next(error);
    }
  }
  static async resetPassword(req, res, next) {
    try {
      res
        .status(200)
        .json(
          await authService.resetPassword(req.body.token, req.body.password)
        );
    } catch (error) {
      next(error);
    }
  }
  static async changePassword(req, res, next) {
    try {
      res
        .status(200)
        .json(
          await authService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
          )
        );
    } catch (error) {
      next(error);
    }
  }
  static async me(req, res, next) {
    try {
      res.status(200).json(await authService.getCurrentUser(req.user.id));
    } catch (error) {
      next(error);
    }
  }
  static async updateProfile(req, res, next) {
    try {
      res
        .status(200)
        .json(await authService.updateProfile(req.user.id, req.body, req.file));
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
