import { searchService } from "./search.service.js";

class SearchController {
  static async globalSearch(req, res, next) {
    try {
      const result = await searchService.globalSearch(
        req.query.q,
        req.user?.id || null
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async searchPolls(req, res, next) {
    try {
      const result = await searchService.searchPolls(
        req.query.q,
        req.query,
        req.query.sort || "newest",
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20,
        req.user?.id || null
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req, res, next) {
    try {
      const result = await searchService.searchUsers(
        req.query.q,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async searchCategories(req, res, next) {
    try {
      const result = await searchService.searchCategories(
        req.query.q,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTrendingPolls(req, res, next) {
    try {
      const result = await searchService.getTrendingPolls();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPopularPolls(req, res, next) {
    try {
      const result = await searchService.getPopularPolls(
        req.query.sortBy || "votes"
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getLatestPolls(req, res, next) {
    try {
      const result = await searchService.getLatestPolls();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEndingSoonPolls(req, res, next) {
    try {
      const result = await searchService.getEndingSoonPolls();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendedPolls(req, res, next) {
    try {
      const result = await searchService.getRecommendedPolls(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getRecentlyViewed(req, res, next) {
    try {
      const result = await searchService.getRecentlyViewed(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addRecentlyViewed(req, res, next) {
    try {
      const result = await searchService.addRecentlyViewed(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSearchHistory(req, res, next) {
    try {
      const result = await searchService.getSearchHistory(
        req.user.id,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSearchHistoryItem(req, res, next) {
    try {
      const result = await searchService.deleteSearchHistoryItem(
        req.user.id,
        req.params.historyId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAllSearchHistory(req, res, next) {
    try {
      const result = await searchService.deleteAllSearchHistory(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSearchSuggestions(req, res, next) {
    try {
      const result = await searchService.getSearchSuggestions(req.query.q);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default SearchController;
