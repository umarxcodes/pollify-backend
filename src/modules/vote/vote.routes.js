import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import VoteController from "./vote.controller.js";
import {
  voteValidation,
  removeVoteValidation,
  getPollVotersValidation,
  getResultsValidation,
  getPollStatsValidation,
  getUserVoteHistoryValidation,
} from "./vote.validation.js";

const router = Router();

const voteLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many voting attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/polls/:pollId/vote",
  voteLimiter,
  authenticate,
  validate(voteValidation),
  VoteController.castVote
);

router.patch(
  "/polls/:pollId/vote",
  voteLimiter,
  authenticate,
  validate(voteValidation),
  VoteController.changeVote
);

router.delete(
  "/polls/:pollId/vote",
  authenticate,
  validate(removeVoteValidation),
  VoteController.removeVote
);

router.get(
  "/polls/:pollId/my-vote",
  authenticate,
  validate(removeVoteValidation),
  VoteController.getMyVote
);

router.get(
  "/polls/:pollId/voters",
  validate(getPollVotersValidation),
  VoteController.getPollVoters
);

router.get(
  "/polls/:pollId/results",
  validate(getResultsValidation),
  VoteController.getPollResults
);

router.get(
  "/polls/:pollId/stats",
  authenticate,
  validate(getPollStatsValidation),
  VoteController.getPollStats
);

router.get(
  "/me/votes",
  authenticate,
  validate(getUserVoteHistoryValidation),
  VoteController.getUserVoteHistory
);

export default router;
