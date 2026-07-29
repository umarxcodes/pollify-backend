import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import BookmarkController from "./bookmark.controller.js";
import {
  savePollValidation,
  removeBookmarkValidation,
  checkBookmarkValidation,
  getBookmarksValidation,
  bookmarkStatsValidation,
} from "./bookmark.validation.js";

const router = Router();

const bookmarkLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many bookmark attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/:pollId",
  bookmarkLimiter,
  authenticate,
  validate(savePollValidation),
  BookmarkController.savePoll
);

router.delete(
  "/:pollId",
  authenticate,
  validate(removeBookmarkValidation),
  BookmarkController.removeBookmark
);

router.get(
  "/:pollId/status",
  validate(checkBookmarkValidation),
  BookmarkController.checkBookmarkStatus
);

router.get(
  "/",
  authenticate,
  validate(getBookmarksValidation),
  BookmarkController.getMyBookmarks
);

router.get(
  "/stats",
  authenticate,
  validate(bookmarkStatsValidation),
  BookmarkController.getBookmarkStats
);

export default router;
