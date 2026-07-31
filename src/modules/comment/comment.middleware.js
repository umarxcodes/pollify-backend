import { ApiError } from "../../utils/apiError.js";

export const checkCommentOwnership = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const Comment = (await import("../../models/Comment.js")).default;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.userId.toString() !== req.user.id.toString()) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }

    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkPollOwnership = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const Comment = (await import("../../models/Comment.js")).default;
    const Poll = (await import("../../models/Poll.js")).default;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    const poll = await Poll.findById(comment.pollId);
    if (!poll) {
      throw new ApiError(404, "Poll not found");
    }

    if (poll.createdBy.toString() !== req.user.id.toString()) {
      throw new ApiError(403, "Only poll owner can perform this action");
    }

    req.comment = comment;
    req.poll = poll;
    next();
  } catch (error) {
    next(error);
  }
};
