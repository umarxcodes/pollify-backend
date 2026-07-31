import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { commentRepository } from "./comment.repository.js";

class CommentService {
  async addComment(pollId, userId, content) {
    const poll = await commentRepository.getPollById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const comment = await commentRepository.createComment({
      pollId,
      userId,
      content,
    });

    return Response.success(201, { comment }, "Comment added successfully");
  }

  async getComments(
    pollId,
    page = 1,
    limit = 20,
    sort = "newest",
    userId = null
  ) {
    const poll = await commentRepository.getPollById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const comments = await commentRepository.findCommentsByPoll(
      pollId,
      page,
      limit,
      sort
    );
    const total = await commentRepository.countCommentsByPoll(pollId);

    let likedCommentIds = [];
    if (userId) {
      likedCommentIds = await commentRepository.getUserLikedComments(
        userId,
        comments.map((c) => c._id)
      );
    }

    const commentIds = comments.map((c) => c._id);
    const repliesMap =
      commentIds.length > 0
        ? await commentRepository.findRepliesByParents(commentIds)
        : {};

    const likedSet = new Set(
      likedCommentIds.map((l) => l.commentId.toString())
    );

    const enrichedComments = comments.map((comment) => {
      const replies = repliesMap[comment._id.toString()] || [];
      return {
        ...comment.toObject(),
        replies,
        hasLiked: likedSet.has(comment._id.toString()),
      };
    });

    return Response.success(
      200,
      {
        comments: enrichedComments,
        pagination: { page, limit, total },
      },
      "Comments fetched successfully"
    );
  }

  async editComment(commentId, userId, content) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.isDeleted) throw new ApiError(400, "Comment has been deleted");

    if (comment.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only edit your own comment");
    }

    if (comment.parentCommentId) {
      throw new ApiError(400, "Cannot edit replies");
    }

    const updated = await commentRepository.updateComment(commentId, {
      content,
      isEdited: true,
    });

    return Response.success(
      200,
      { comment: updated },
      "Comment updated successfully"
    );
  }

  async deleteComment(commentId, userId) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.isDeleted)
      throw new ApiError(400, "Comment has already been deleted");

    if (comment.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own comment");
    }

    if (comment.parentCommentId) {
      await commentRepository.decrementRepliesCount(comment.parentCommentId);
    }

    await commentRepository.softDeleteComment(commentId);

    return Response.success(200, null, "Comment deleted successfully");
  }

  async replyToComment(commentId, userId, content) {
    const parentComment = await commentRepository.findCommentById(commentId);
    if (!parentComment) throw new ApiError(404, "Comment not found");
    if (parentComment.isDeleted)
      throw new ApiError(400, "Comment has been deleted");
    if (parentComment.parentCommentId) {
      throw new ApiError(400, "Cannot reply to a reply");
    }

    const pollId = parentComment.pollId;
    const poll = await commentRepository.getPollById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const reply = await commentRepository.createComment({
      pollId: pollId.toString(),
      userId,
      parentCommentId: commentId,
      content,
    });

    await commentRepository.incrementRepliesCount(commentId);

    return Response.success(
      201,
      { comment: reply },
      "Reply added successfully"
    );
  }

  async unlikeComment(commentId, userId) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.isDeleted) throw new ApiError(400, "Comment has been deleted");

    await commentRepository.removeLike(commentId, userId);

    return Response.success(
      200,
      { liked: false },
      "Comment unliked successfully"
    );
  }

  async toggleLike(commentId, userId) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.isDeleted) throw new ApiError(400, "Comment has been deleted");

    const existingLike = await commentRepository.hasUserLiked(
      commentId,
      userId
    );
    if (existingLike) {
      await commentRepository.removeLike(commentId, userId);
      return Response.success(
        200,
        { liked: false },
        "Comment unliked successfully"
      );
    }

    await commentRepository.createLike(commentId, userId);
    await commentRepository.incrementLikesCount(commentId);
    return Response.success(200, { liked: true }, "Comment liked successfully");
  }

  async pinComment(commentId, userId) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const poll = await commentRepository.getPollById(comment.pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (poll.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only poll owner can pin comments");
    }

    if (comment.isPinned) {
      throw new ApiError(400, "Comment is already pinned");
    }

    const updated = await commentRepository.updateComment(commentId, {
      isPinned: true,
    });

    return Response.success(
      200,
      { comment: updated },
      "Comment pinned successfully"
    );
  }

  async unpinComment(commentId, userId) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const poll = await commentRepository.getPollById(comment.pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (poll.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only poll owner can unpin comments");
    }

    if (!comment.isPinned) {
      throw new ApiError(400, "Comment is not pinned");
    }

    const updated = await commentRepository.updateComment(commentId, {
      isPinned: false,
    });

    return Response.success(
      200,
      { comment: updated },
      "Comment unpinned successfully"
    );
  }

  async reportComment(commentId, userId, reason) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.isDeleted) throw new ApiError(400, "Comment has been deleted");

    const existingReport = await commentRepository.hasUserReported(
      commentId,
      userId
    );
    if (existingReport) {
      throw new ApiError(409, "You have already reported this comment");
    }

    await commentRepository.createReport({
      commentId,
      userId,
      reason,
    });

    return Response.success(201, null, "Comment reported successfully");
  }

  async getCommentAnalytics(pollId, userId) {
    const poll = await commentRepository.getPollById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    if (poll.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only poll owner can view analytics");
    }

    const totalComments = await commentRepository.getPollCommentsCount(pollId);
    const totalReplies = await commentRepository.getPollRepliesCount(pollId);
    const mostLikedComment =
      await commentRepository.getMostLikedComment(pollId);
    const pinnedComments = await commentRepository.getPinnedComments(pollId);
    const activeCommenters =
      await commentRepository.getActiveCommenters(pollId);

    return Response.success(
      200,
      {
        totalComments,
        totalReplies,
        mostLikedComment,
        pinnedComments,
        activeCommenters: activeCommenters.length,
      },
      "Comment analytics fetched successfully"
    );
  }
}

export const commentService = new CommentService();
