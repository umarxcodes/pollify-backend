import { bookmarkService } from "./bookmark.service.js";

class BookmarkController {
  static async savePoll(req, res, next) {
    try {
      const result = await bookmarkService.savePoll(
        req.user.id,
        req.params.pollId
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async removeBookmark(req, res, next) {
    try {
      const result = await bookmarkService.removeBookmark(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async checkBookmarkStatus(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const result = await bookmarkService.checkBookmarkStatus(
        userId,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookmarks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || "newest";
      const search = req.query.search || "";
      const result = await bookmarkService.getMyBookmarks(
        req.user.id,
        page,
        limit,
        sort,
        search
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getBookmarkStats(req, res, next) {
    try {
      const result = await bookmarkService.getBookmarkStats(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default BookmarkController;
