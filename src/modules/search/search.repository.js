import Poll from "../../models/Poll.js";
import User from "../../models/User.js";
import SearchHistory from "../../models/SearchHistory.js";
import RecentlyViewed from "../../models/RecentlyViewed.js";
import Bookmark from "../../models/Bookmark.js";
import Vote from "../../models/Vote.js";

class SearchRepository {
  async searchPolls(
    query,
    filters = {},
    sort = "newest",
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return { polls: [], total: 0 };
    }

    let searchQuery = { status: "active", $text: { $search: query } };

    if (filters.category) {
      searchQuery.category = filters.category;
    }
    if (filters.type) {
      searchQuery.type = filters.type;
    }
    if (filters.createdBy) {
      searchQuery.createdBy = filters.createdBy;
    }
    if (filters.minVotes !== undefined) {
      searchQuery.totalVotes = { $gte: parseInt(filters.minVotes) };
    }
    if (filters.dateFrom || filters.dateTo) {
      searchQuery.createdAt = {};
      if (filters.dateFrom)
        searchQuery.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) searchQuery.createdAt.$lte = new Date(filters.dateTo);
    }

    let sortOption = { score: { $meta: "textScore" } };
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most_voted") sortOption = { totalVotes: -1 };
    else if (sort === "most_commented") sortOption = { commentsCount: -1 };
    else if (sort === "trending")
      sortOption = { trendingScore: -1, createdAt: -1 };

    const polls = await Poll.find(searchQuery, {
      score: { $meta: "textScore" },
    })
      .populate("createdBy", "name username")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await Poll.countDocuments(searchQuery);

    return { polls, total };
  }

  async searchUsers(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const users = await User.find(
      {
        $text: { $search: query },
        isVerified: true,
        isSuspended: { $ne: true },
      },
      { score: { $meta: "textScore" } }
    )
      .select("name username profileImage bio createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: "textScore" } });

    const total = await User.countDocuments({
      $text: { $search: query },
      isVerified: true,
      isSuspended: { $ne: true },
    });

    return { users, total };
  }

  async getCategories(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: { status: "active", category: { $nin: [null, ""] } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalVotes: { $sum: "$totalVotes" },
        },
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    if (query) {
      pipeline.unshift({
        $match: { category: { $regex: query, $options: "i" } },
      });
    }

    const categories = await Poll.aggregate(pipeline);
    return { categories };
  }

  async getTrendingPolls(limit = 10) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return await Poll.aggregate([
      { $match: { status: "active", createdAt: { $gte: oneWeekAgo } } },
      {
        $lookup: {
          from: "votes",
          let: { pollId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pollId", "$$pollId"] } } },
            { $count: "count" },
          ],
          as: "voteStats",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { pollId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pollId", "$$pollId"] } } },
            { $count: "count" },
          ],
          as: "commentStats",
        },
      },
      {
        $lookup: {
          from: "bookmarks",
          let: { pollId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pollId", "$$pollId"] } } },
            { $count: "count" },
          ],
          as: "bookmarkStats",
        },
      },
      {
        $addFields: {
          recentVotes: {
            $ifNull: [{ $arrayElemAt: ["$voteStats.count", 0] }, 0],
          },
          recentComments: {
            $ifNull: [{ $arrayElemAt: ["$commentStats.count", 0] }, 0],
          },
          recentBookmarks: {
            $ifNull: [{ $arrayElemAt: ["$bookmarkStats.count", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$totalVotes", 0.4] },
              { $multiply: ["$recentComments", 0.3] },
              { $multiply: ["$recentBookmarks", 0.2] },
              { $multiply: ["$recentVotes", 0.1] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ]);
  }

  async getPopularPolls(limit = 10, sortBy = "votes") {
    let sortOption = { totalVotes: -1 };
    if (sortBy === "comments") sortOption = { commentsCount: -1 };
    else if (sortBy === "saved") sortOption = { savedCount: -1 };

    return await Poll.find({ status: "active" })
      .populate("createdBy", "name username")
      .sort(sortOption)
      .limit(limit);
  }

  async getLatestPolls(limit = 10) {
    return await Poll.find({ status: "active" })
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getEndingSoonPolls(limit = 10) {
    const twentyFourHours = new Date();
    twentyFourHours.setHours(twentyFourHours.getHours() + 24);

    return await Poll.find({
      status: "active",
      expiresAt: { $gte: new Date(), $lte: twentyFourHours },
    })
      .populate("createdBy", "name username")
      .sort({ expiresAt: 1 })
      .limit(limit);
  }

  async getRecommendedPolls(userId, limit = 10) {
    const userBookmarks = await Bookmark.find({ userId }).populate(
      "pollId",
      "category"
    );
    const userVotes = await Vote.find({ userId }).populate(
      "pollId",
      "category"
    );

    const categories = new Set();
    userBookmarks.forEach(
      (b) => b.pollId?.category && categories.add(b.pollId.category)
    );
    userVotes.forEach(
      (v) => v.pollId?.category && categories.add(v.pollId.category)
    );

    const categoryArray = Array.from(categories);
    let query = { status: "active" };
    if (categoryArray.length > 0) {
      query.category = { $in: categoryArray };
    }

    return await Poll.find(query)
      .populate("createdBy", "name username")
      .sort({ totalVotes: -1 })
      .limit(limit);
  }

  async getRecentlyViewed(userId, limit = 20) {
    const views = await RecentlyViewed.find({ userId })
      .populate({
        path: "pollId",
        populate: {
          path: "createdBy",
          select: "name username",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return views.map((v) => v.pollId).filter(Boolean);
  }

  async addRecentlyViewed(userId, pollId) {
    if (!userId) return;
    await RecentlyViewed.findOneAndUpdate(
      { userId, pollId },
      { userId, pollId },
      { upsert: true, new: true }
    );
  }

  async addSearchHistory(userId, query, resultsCount) {
    if (!userId) return;
    await SearchHistory.findOneAndUpdate(
      { userId },
      {
        $push: {
          entries: { query, resultsCount, createdAt: new Date() },
        },
        $slice: { entries: -20 },
      },
      { upsert: true, new: true }
    );
  }

  async getSearchHistory(userId, page = 1, limit = 20) {
    const doc = await SearchHistory.findOne({ userId }).sort({
      createdAt: -1,
    });
    const entries = doc?.entries || [];
    const total = entries.length;
    const skip = (page - 1) * limit;
    const history = entries.slice(skip, skip + limit).reverse();

    return { history, total };
  }

  async deleteSearchHistoryItem(userId, historyId) {
    return await SearchHistory.findOneAndUpdate(
      { userId },
      { $pull: { entries: { _id: historyId } } }
    );
  }

  async deleteAllSearchHistory(userId) {
    return await SearchHistory.deleteMany({ userId });
  }

  async getSearchSuggestions(query) {
    if (!query || query.trim().length < 2) {
      return { polls: [], users: [], categories: [] };
    }

    const pollSuggestions = await Poll.find(
      { status: "active", $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .select("title")
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    const userSuggestions = await User.find(
      {
        $text: { $search: query },
        isVerified: true,
        isSuspended: { $ne: true },
      },
      { score: { $meta: "textScore" } }
    )
      .select("username name")
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    const categorySuggestions = await Poll.aggregate([
      {
        $match: {
          status: "active",
          category: { $regex: query, $options: "i" },
        },
      },
      { $group: { _id: "$category" } },
      { $limit: 5 },
    ]);

    return {
      polls: pollSuggestions.map((p) => ({ id: p._id, title: p.title })),
      users: userSuggestions.map((u) => ({
        id: u._id,
        username: u.username,
        name: u.name,
      })),
      categories: categorySuggestions.map((c) => c._id),
    };
  }
}

export const searchRepository = new SearchRepository();
