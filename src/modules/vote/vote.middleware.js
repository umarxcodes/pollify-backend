import { ApiError } from "../../utils/apiError.js";
import Poll from "../../models/Poll.js";
import Vote from "../../models/Vote.js";

export const validatePollOwnership = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (poll.createdBy.toString() !== req.user.id)
      throw new ApiError(403, "You are not authorized to access this resource");
    req.poll = poll;
    next();
  } catch (error) {
    next(error);
  }
};

export const preventDuplicateVote = async (req, res, next) => {
  try {
    const existingVote = await Vote.findOne({
      pollId: req.params.pollId,
      userId: req.user.id,
    });
    if (existingVote)
      throw new ApiError(409, "You have already voted on this poll");
    next();
  } catch (error) {
    next(error);
  }
};
