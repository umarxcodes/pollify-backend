import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import PollController from "./poll.controller.js";
import {
  createPollValidation,
  updatePollValidation,
  getPollValidation,
  getPollsValidation,
  getPollResultsValidation,
} from "./poll.validation.js";
import { checkPollOwnership } from "./poll.middleware.js";

const router = Router();

router.get("/", validate(getPollsValidation), PollController.getPolls);
router.get("/:id", validate(getPollValidation), PollController.getPollById);
router.post(
  "/",
  authenticate,
  validate(createPollValidation),
  PollController.createPoll
);
router.patch(
  "/:id",
  authenticate,
  validate(updatePollValidation),
  checkPollOwnership,
  PollController.updatePoll
);
router.delete(
  "/:id",
  authenticate,
  validate(getPollValidation),
  checkPollOwnership,
  PollController.deletePoll
);
router.get(
  "/:pollId/results",
  validate(getPollResultsValidation),
  PollController.getPollResults
);

export default router;
