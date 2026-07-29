import { commentService } from "./comment.service.js";

class CommentController {
  static async addComment(req, res, next) {
    try {
      const result = await commentService.addComment(
        req.params.pollId,
        req.user.id,
        req.body.content
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getComments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || "newest";
      const result = await commentService.getComments(
        req.params.pollId,
        page,
        limit,
        sort,
        req.user?.id || null
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async editComment(req, res, next) {
    try {
      const result = await commentService.editComment(
        req.params.commentId,
        req.user.id,
        req.body.content
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(
        req.params.commentId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async replyToComment(req, res, next) {
    try {
      const result = await commentService.replyToComment(
        req.params.commentId,
        req.user.id,
        req.params.pollId,
        req.body.content
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async likeComment(req, res, next) {
    try {
      const result = await commentService.toggleLike(
        req.params.commentId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unlikeComment(req, res, next) {
    try {
      const result = await commentService.toggleLike(
        req.params.commentId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async pinComment(req, res, next) {
    try {
      const result = await commentService.pinComment(
        req.params.commentId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unpinComment(req, res, next) {
    try {
      const result = await commentService.unpinComment(
        req.params.commentId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async reportComment(req, res, next) {
    try {
      const result = await commentService.reportComment(
        req.params.commentId,
        req.user.id,
        req.body.reason
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCommentAnalytics(req, res, next) {
    try {
      const result = await commentService.getCommentAnalytics(
        req.params.pollId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default CommentController;
