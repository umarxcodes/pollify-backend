import mongoose from "mongoose";
import Poll from "../../models/Poll.js";
import Vote from "../../models/Vote.js";

class AnalyticsRepository {
  async getPollOverview(pollId) {
    const poll = await Poll.findById(pollId)
      .populate("createdBy", "name username")
      .lean();

    if (!poll) return null;

    const totalVotes = await Vote.countDocuments({ pollId });
    const uniqueVoters = await Vote.distinct("userId", { pollId }).exec();
    const anonymousVotes = await Vote.countDocuments({
      pollId,
      isAnonymous: true,
    });
    const registeredVotes = totalVotes - anonymousVotes;

    return {
      ...poll,
      totalVotes,
      uniqueVoters: uniqueVoters.length,
      anonymousVotes,
      registeredVotes,
    };
  }

  async getOptionAnalytics(pollId) {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) return null;

    const voteCounts = await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $unwind: "$selectedOptions" },
      { $group: { _id: "$selectedOptions", count: { $sum: 1 } } },
    ]);

    const totalVotes = poll.totalVotes || 0;
    const optionMap = new Map(
      voteCounts.map((v) => [v._id.toString(), v.count])
    );

    const rankedOptions = poll.options
      .map((opt) => {
        const id = opt._id.toString();
        const count = optionMap.get(id) || 0;
        const percentage =
          totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          optionId: id,
          text: opt.text,
          votes: count,
          percentage,
        };
      })
      .sort((a, b) => b.votes - a.votes || a.optionId.localeCompare(b.optionId))
      .map((opt, index) => ({
        ...opt,
        rank: index + 1,
        isWinner: index === 0 && totalVotes > 0,
      }));

    const winner = rankedOptions.find((opt) => opt.isWinner) || null;

    return {
      options: rankedOptions,
      winner,
      totalVotes,
      winningPercentage: winner ? winner.percentage : 0,
    };
  }

  async getVoteTimeline(pollId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVotes = await Vote.aggregate([
      {
        $match: {
          pollId: new mongoose.Types.ObjectId(pollId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const hourlyVotes = await Vote.aggregate([
      {
        $match: {
          pollId: new mongoose.Types.ObjectId(pollId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { hour: { $hour: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.hour": 1 } },
    ]);

    const totalVotes = dailyVotes.reduce((sum, d) => sum + d.count, 0);
    const daysActive = Math.max(
      1,
      Math.ceil((new Date() - thirtyDaysAgo) / (1000 * 60 * 60 * 24))
    );
    const avgVotesPerDay = Math.round((totalVotes / daysActive) * 100) / 100;

    return {
      daily: dailyVotes,
      hourly: hourlyVotes,
      totalVotes,
      avgVotesPerDay,
      daysActive,
    };
  }

  async getVoterAnalytics(pollId) {
    const poll = await Poll.findById(pollId).select("type").lean();
    if (!poll) return null;

    const totalVotes = await Vote.countDocuments({ pollId });
    const anonymousVotes = await Vote.countDocuments({
      pollId,
      isAnonymous: true,
    });
    const registeredVotes = totalVotes - anonymousVotes;
    const uniqueVoters = await Vote.distinct("userId", { pollId }).exec();

    const publicVoters =
      poll.type === "anonymous"
        ? []
        : (
            await Vote.find({ pollId, isAnonymous: false })
              .populate("userId", "name username profileImage")
              .sort({ createdAt: -1 })
              .limit(10)
              .lean()
          ).map((v) => ({
            userId: v.userId?._id,
            name: v.userId?.name,
            username: v.userId?.username,
            profileImage: v.userId?.profileImage,
            votedAt: v.createdAt,
          }));

    return {
      totalVotes,
      uniqueVoters: uniqueVoters.length,
      anonymousVotes,
      registeredVotes,
      recentVoters: publicVoters,
    };
  }

  async getPollStatus(pollId) {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) return null;

    const now = new Date();
    let status = poll.status;

    if (status === "active" && poll.expiresAt && now > poll.expiresAt) {
      status = "expired";
    }

    const totalVotes = poll.totalVotes || 0;
    const options = poll.options || [];
    const totalOptionVotes = options.reduce(
      (sum, opt) => sum + (opt.votes || 0),
      0
    );
    const pollCompletionRate =
      totalVotes > 0
        ? Math.round((totalVotes / Math.max(1, totalOptionVotes)) * 100)
        : 0;

    return {
      status,
      isExpired: status === "expired",
      isActive: status === "active",
      isDraft: status === "draft",
      expiresAt: poll.expiresAt,
      pollCompletionRate,
    };
  }

  async getTrendAnalytics(pollId) {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) return null;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weekVotes = await Vote.countDocuments({
      pollId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const monthVotes = await Vote.countDocuments({
      pollId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const dailyGrowth =
      poll.totalVotes > 0 ? Math.round((poll.totalVotes / 30) * 100) / 100 : 0;
    const weeklyGrowth =
      poll.totalVotes > 0 ? Math.round((poll.totalVotes / 4) * 100) / 100 : 0;
    const monthlyGrowth = poll.totalVotes > 0 ? poll.totalVotes : 0;

    const trendingScore = Math.min(
      100,
      Math.round(
        poll.totalVotes * 0.5 +
          weekVotes * 2 +
          monthVotes * 0.5 +
          (poll.lastVoteAt ? 10 : 0)
      )
    );

    return {
      dailyGrowth,
      weeklyGrowth,
      monthlyGrowth,
      trendingScore,
      weekVotes,
      monthVotes,
      lastVoteAt: poll.lastVoteAt,
    };
  }

  async getDashboardAnalytics(userId) {
    const polls = await Poll.find({ createdBy: userId }).lean();
    const totalPolls = polls.length;

    const totalVotes = polls.reduce(
      (sum, poll) => sum + (poll.totalVotes || 0),
      0
    );
    const avgVotes =
      totalPolls > 0 ? Math.round((totalVotes / totalPolls) * 100) / 100 : 0;

    const pollPerformance = polls
      .map((poll) => ({
        pollId: poll._id,
        title: poll.title,
        totalVotes: poll.totalVotes || 0,
        status: poll.status,
        createdAt: poll.createdAt,
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);

    const mostPopular = pollPerformance[0] || null;
    const leastPopular = pollPerformance[pollPerformance.length - 1] || null;

    const publishedPolls = polls.filter(
      (p) => p.status === "active" || p.status === "expired"
    ).length;
    const completionRate =
      totalPolls > 0 ? Math.round((publishedPolls / totalPolls) * 100) : 0;

    return {
      totalPolls,
      totalVotes,
      avgVotes,
      completionRate,
      mostPopularPoll: mostPopular,
      leastPopularPoll: leastPopular,
      polls: pollPerformance,
    };
  }

  async getChartData(pollId) {
    const optionAnalytics = await this.getOptionAnalytics(pollId);
    if (!optionAnalytics) return null;

    const labels = optionAnalytics.options.map((opt) => opt.text);
    const voteCounts = optionAnalytics.options.map((opt) => opt.votes);
    const percentages = optionAnalytics.options.map((opt) => opt.percentage);

    return {
      pie: {
        labels,
        datasets: [
          {
            data: voteCounts,
            backgroundColor: [
              "#3b82f6",
              "#ef4444",
              "#10b981",
              "#f59e0b",
              "#8b5cf6",
            ],
          },
        ],
      },
      bar: {
        labels,
        datasets: [
          { label: "Votes", data: voteCounts, backgroundColor: "#3b82f6" },
        ],
      },
      line: {
        labels: optionAnalytics.options.map((opt) => opt.text),
        datasets: [
          {
            label: "Votes",
            data: voteCounts,
            borderColor: "#3b82f6",
            tension: 0.1,
          },
          {
            label: "Percentage",
            data: percentages,
            borderColor: "#10b981",
            tension: 0.1,
          },
        ],
      },
      area: {
        labels: optionAnalytics.options.map((opt) => opt.text),
        datasets: [
          {
            label: "Votes",
            data: voteCounts,
            backgroundColor: "rgba(59,130,246,0.2)",
            borderColor: "#3b82f6",
            fill: true,
          },
        ],
      },
    };
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
        $addFields: {
          recentVotes: {
            $ifNull: [{ $arrayElemAt: ["$voteStats.count", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$totalVotes", 0.3] },
              { $multiply: ["$recentVotes", 2] },
              { $cond: [{ $gt: ["$lastVoteAt", oneWeekAgo] }, 10, 0] },
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
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          totalVotes: 1,
          status: 1,
          type: 1,
          createdAt: 1,
          "creator.name": 1,
          "creator.username": 1,
          trendingScore: 1,
        },
      },
    ]);
  }
}

export const analyticsRepository = new AnalyticsRepository();
