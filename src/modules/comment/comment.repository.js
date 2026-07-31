import Comment from "../../models/Comment.js";
import CommentLike from "../../models/CommentLike.js";
import CommentReport from "../../models/CommentReport.js";
import Poll from "../../models/Poll.js";

class CommentRepository {
  async createComment(data) {
    return await Comment.create(data);
  }

  async findCommentById(id) {
    return await Comment.findById(id);
  }

  async findCommentByIdAndPoll(id, pollId) {
    return await Comment.findOne({ _id: id, pollId, isDeleted: false });
  }

  async findCommentsByPoll(pollId, page = 1, limit = 20, sort = "newest") {
    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "most_liked") {
      sortOption = { likesCount: -1, createdAt: -1 };
    } else if (sort === "pinned") {
      sortOption = { isPinned: -1, createdAt: -1 };
    }

    return await Comment.find({
      pollId,
      parentCommentId: null,
      isDeleted: false,
    })
      .populate("userId", "name username profileImage")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);
  }

  async findRepliesByParent(parentCommentId) {
    return await Comment.find({
      parentCommentId,
      isDeleted: false,
    })
      .populate("userId", "name username profileImage")
      .sort({ createdAt: 1 });
  }

  async findRepliesByParents(parentCommentIds) {
    const replies = await Comment.find({
      parentCommentId: { $in: parentCommentIds },
      isDeleted: false,
    })
      .populate("userId", "name username profileImage")
      .sort({ createdAt: 1 });

    const grouped = {};
    for (const reply of replies) {
      const parentId = reply.parentCommentId.toString();
      if (!grouped[parentId]) grouped[parentId] = [];
      grouped[parentId].push(reply);
    }
    return grouped;
  }

  async updateComment(id, updates) {
    return await Comment.findByIdAndUpdate(id, updates, { new: true });
  }

  async softDeleteComment(id) {
    const comment = await Comment.findById(id);
    if (!comment) return null;
    const contentToPreserve = comment.originalContent || comment.content;
    return await Comment.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        originalContent: contentToPreserve,
        content: "This comment has been deleted.",
      },
      { new: true }
    );
  }

  async incrementRepliesCount(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { repliesCount: 1 } },
      { new: true }
    );
  }

  async decrementRepliesCount(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { repliesCount: -1 } },
      { new: true }
    );
  }

  async incrementLikesCount(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
  }

  async decrementLikesCount(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
  }

  async removeLike(commentId, userId) {
    const existingLike = await CommentLike.findOne({ commentId, userId });
    if (!existingLike) return { liked: false };
    await CommentLike.deleteOne({ _id: existingLike._id });
    await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
    return { liked: false };
  }

  async createLike(commentId, userId) {
    return await CommentLike.create({ commentId, userId });
  }

  async toggleLike(commentId, userId) {
    const existingLike = await CommentLike.findOne({ commentId, userId });
    if (existingLike) {
      await CommentLike.deleteOne({ _id: existingLike._id });
      return { liked: false };
    }
    await CommentLike.create({ commentId, userId });
    return { liked: true };
  }

  async hasUserLiked(commentId, userId) {
    return await CommentLike.exists({ commentId, userId });
  }

  async getUserLikedComments(userId, commentIds) {
    return await CommentLike.find({
      commentId: { $in: commentIds },
      userId,
    }).select("commentId");
  }

  async createReport(data) {
    return await CommentReport.create(data);
  }

  async hasUserReported(commentId, userId) {
    return await CommentReport.exists({ commentId, userId });
  }

  async getPollCommentsCount(pollId) {
    return await Comment.countDocuments({ pollId, isDeleted: false });
  }

  async getPollRepliesCount(pollId) {
    return await Comment.countDocuments({
      pollId,
      parentCommentId: { $ne: null },
      isDeleted: false,
    });
  }

  async getMostLikedComment(pollId) {
    return await Comment.findOne({ pollId, isDeleted: false })
      .sort({ likesCount: -1 })
      .limit(1);
  }

  async getPinnedComments(pollId) {
    return await Comment.find({
      pollId,
      isPinned: true,
      isDeleted: false,
    }).populate("userId", "name username profileImage");
  }

  async getActiveCommenters(pollId) {
    return await Comment.distinct("userId", {
      pollId,
      isDeleted: false,
    });
  }

  async getPollById(pollId) {
    return await Poll.findById(pollId).select("createdBy");
  }

  async countCommentsByPoll(pollId) {
    return await Comment.countDocuments({ pollId, isDeleted: false });
  }

  async countRepliesByPoll(pollId) {
    return await Comment.countDocuments({
      pollId,
      parentCommentId: { $ne: null },
      isDeleted: false,
    });
  }
}

export const commentRepository = new CommentRepository();
