import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import SearchController from "./search.controller.js";
import {
  globalSearchValidation,
  searchPollsValidation,
  searchUsersValidation,
  searchCategoriesValidation,
  searchHistoryValidation,
  deleteHistoryItemValidation,
  recentlyViewedValidation,
  suggestionsValidation,
} from "./search.validation.js";

const router = Router();

const searchLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many search requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/",
  searchLimiter,
  validate(globalSearchValidation),
  SearchController.globalSearch
);

router.get(
  "/polls",
  searchLimiter,
  validate(searchPollsValidation),
  SearchController.searchPolls
);

router.get(
  "/users",
  searchLimiter,
  validate(searchUsersValidation),
  SearchController.searchUsers
);

router.get(
  "/categories",
  searchLimiter,
  validate(searchCategoriesValidation),
  SearchController.searchCategories
);

router.get("/trending", searchLimiter, SearchController.getTrendingPolls);

router.get("/popular", searchLimiter, SearchController.getPopularPolls);

router.get("/latest", searchLimiter, SearchController.getLatestPolls);

router.get("/ending-soon", searchLimiter, SearchController.getEndingSoonPolls);

router.get(
  "/recommended",
  authenticate,
  searchLimiter,
  SearchController.getRecommendedPolls
);

router.get("/recent", authenticate, SearchController.getRecentlyViewed);

router.post(
  "/recent/:pollId",
  authenticate,
  validate(recentlyViewedValidation),
  SearchController.addRecentlyViewed
);

router.get(
  "/history",
  authenticate,
  validate(searchHistoryValidation),
  SearchController.getSearchHistory
);

router.delete(
  "/history",
  authenticate,
  validate(searchHistoryValidation),
  SearchController.deleteAllSearchHistory
);

router.delete(
  "/history/:historyId",
  authenticate,
  validate(deleteHistoryItemValidation),
  SearchController.deleteSearchHistoryItem
);

router.get(
  "/suggestions",
  searchLimiter,
  validate(suggestionsValidation),
  SearchController.getSearchSuggestions
);

export default router;
