import mongoose from "mongoose";
import Bookmark from "../../models/Bookmark.js";
import Poll from "../../models/Poll.js";
import User from "../../models/User.js";
import Comment from "../../models/Comment.js";
import Vote from "../../models/Vote.js";

class BookmarkRepository {
  async createBookmark(userId, pollId) {
    return await Bookmark.create({ userId, pollId });
  }

  async findBookmark(userId, pollId) {
    return await Bookmark.findOne({ userId, pollId });
  }

  async deleteBookmark(userId, pollId) {
    return await Bookmark.findOneAndDelete({ userId, pollId });
  }

  async deleteBookmarksByPoll(pollId) {
    return await Bookmark.deleteMany({ pollId });
  }

  async getUserBookmarks(userId, page = 1, limit = 20, sort = "newest") {
    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "most_popular") {
      sortOption = { "poll.totalVotes": -1, createdAt: -1 };
    } else if (sort === "recently_saved") {
      sortOption = { createdAt: -1 };
    }

    return await Bookmark.find({ userId })
      .populate({
        path: "pollId",
        populate: {
          path: "createdBy",
          select: "name username",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort(sortOption);
  }

  async countUserBookmarks(userId) {
    return await Bookmark.countDocuments({ userId });
  }

  async hasUserBookmarked(userId, pollId) {
    return await Bookmark.exists({ userId, pollId });
  }

  async getBookmarksByPoll(pollId) {
    return await Bookmark.find({ pollId }).populate("userId", "name username");
  }

  async getPollById(pollId) {
    return await Poll.findById(pollId).select(
      "title status type category savedCount totalVotes createdAt createdBy"
    );
  }

  async getUserById(userId) {
    return await User.findById(userId).select("name username");
  }

  async getPollCommentCount(pollId) {
    return await Comment.countDocuments({ pollId, isDeleted: false });
  }

  async getPollVoteCount(pollId) {
    return await Vote.countDocuments({ pollId });
  }

  async getMostSavedCategory(userId) {
    const result = await Bookmark.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "polls",
          localField: "pollId",
          foreignField: "_id",
          as: "poll",
        },
      },
      { $unwind: "$poll" },
      {
        $group: {
          _id: "$poll.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return result[0]?._id || "Uncategorized";
  }

  async getMostPopularSavedPoll(userId) {
    const bookmark = await Bookmark.findOne({ userId })
      .populate({
        path: "pollId",
        select: "title totalVotes",
      })
      .sort({ "pollId.totalVotes": -1 })
      .limit(1);
    return bookmark?.pollId || null;
  }

  async getRecentlySavedPoll(userId) {
    const bookmark = await Bookmark.findOne({ userId })
      .populate({
        path: "pollId",
        select: "title",
      })
      .sort({ createdAt: -1 })
      .limit(1);
    return bookmark?.pollId || null;
  }
}

export const bookmarkRepository = new BookmarkRepository();
