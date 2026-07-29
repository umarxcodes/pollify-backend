import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  checkCommentOwnership,
  checkPollOwnership,
} from "./comment.middleware.js";
import CommentController from "./comment.controller.js";
import {
  addCommentValidation,
  getCommentsValidation,
  editCommentValidation,
  deleteCommentValidation,
  replyValidation,
  likeValidation,
  pinValidation,
  reportValidation,
  analyticsValidation,
} from "./comment.validation.js";

const router = Router();

const commentLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many comment attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/polls/:pollId/comments",
  commentLimiter,
  authenticate,
  validate(addCommentValidation),
  CommentController.addComment
);

router.get(
  "/polls/:pollId/comments",
  validate(getCommentsValidation),
  CommentController.getComments
);

router.patch(
  "/:commentId",
  authenticate,
  validate(editCommentValidation),
  checkCommentOwnership,
  CommentController.editComment
);

router.delete(
  "/:commentId",
  authenticate,
  validate(deleteCommentValidation),
  checkCommentOwnership,
  CommentController.deleteComment
);

router.post(
  "/:commentId/replies",
  commentLimiter,
  authenticate,
  validate(replyValidation),
  CommentController.replyToComment
);

router.post(
  "/:commentId/like",
  authenticate,
  validate(likeValidation),
  CommentController.likeComment
);

router.delete(
  "/:commentId/like",
  authenticate,
  validate(likeValidation),
  CommentController.unlikeComment
);

router.patch(
  "/:commentId/pin",
  authenticate,
  validate(pinValidation),
  checkPollOwnership,
  CommentController.pinComment
);

router.delete(
  "/:commentId/pin",
  authenticate,
  validate(pinValidation),
  checkPollOwnership,
  CommentController.unpinComment
);

router.post(
  "/:commentId/report",
  authenticate,
  validate(reportValidation),
  CommentController.reportComment
);

router.get(
  "/polls/:pollId/analytics",
  authenticate,
  validate(analyticsValidation),
  CommentController.getCommentAnalytics
);

export default router;
