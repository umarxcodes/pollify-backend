import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import FollowController from "./follow.controller.js";
import { followValidation, getUserValidation } from "./follow.validation.js";

const router = Router();

router.post(
  "/:userId/follow",
  authenticate,
  validate(followValidation),
  FollowController.followUser
);

router.delete(
  "/:userId/follow",
  authenticate,
  validate(followValidation),
  FollowController.unfollowUser
);

router.get(
  "/:userId/followers",
  validate(getUserValidation),
  FollowController.getFollowers
);

router.get(
  "/:userId/following",
  validate(getUserValidation),
  FollowController.getFollowing
);

router.get(
  "/:userId/follow-status",
  authenticate,
  validate(getUserValidation),
  FollowController.checkFollowStatus
);

export default router;
