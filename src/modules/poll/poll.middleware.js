import { ApiError } from "../../utils/apiError.js";
import Poll from "../../models/Poll.js";
import User from "../../models/User.js";

export const checkPollOwnership = async (req, res, next) => {
  try {
    const pollId = req.params.id;
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const user = await User.findById(req.user.id);
    if (poll.createdBy.toString() !== req.user.id && user.role !== "admin") {
      throw new ApiError(403, "You are not authorized to modify this poll");
    }

    req.poll = poll;
    next();
  } catch (error) {
    next(error);
  }
};
