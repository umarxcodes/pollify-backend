import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { analyticsRepository } from "./analytics.repository.js";
import User from "../../models/User.js";

class AnalyticsService {
  async getPollAnalytics(pollId, userId) {
    const overview = await analyticsRepository.getPollOverview(pollId);
    if (!overview) throw new ApiError(404, "Poll not found");

    const user = await User.findById(userId).select("role").lean();
    const isOwner = overview.createdBy?._id?.toString() === userId.toString();
    const isAdmin = ["admin", "super_admin"].includes(user?.role);
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "Only the poll owner can view poll analytics");
    }

    const optionAnalytics =
      await analyticsRepository.getOptionAnalytics(pollId);
    const timeline = await analyticsRepository.getVoteTimeline(pollId);
    const voters = await analyticsRepository.getVoterAnalytics(pollId);
    const status = await analyticsRepository.getPollStatus(pollId);
    const trends = await analyticsRepository.getTrendAnalytics(pollId);
    const chartData = await analyticsRepository.getChartData(pollId);

    return Response.success(
      200,
      {
        overview: {
          id: overview._id,
          title: overview.title,
          description: overview.description,
          status: status?.status || overview.status,
          createdBy: overview.createdBy,
          createdAt: overview.createdAt,
          expiresAt: overview.expiresAt,
          type: overview.type,
          totalOptions: overview.options?.length || 0,
        },
        results: optionAnalytics,
        timeline,
        voters,
        status,
        trends,
        chartData,
      },
      "Poll analytics fetched successfully"
    );
  }

  async getPollResults(pollId) {
    const optionAnalytics =
      await analyticsRepository.getOptionAnalytics(pollId);
    if (!optionAnalytics) throw new ApiError(404, "Poll not found");

    const overview = await analyticsRepository.getPollOverview(pollId);
    if (!overview) throw new ApiError(404, "Poll not found");

    return Response.success(
      200,
      {
        poll: {
          id: overview._id,
          title: overview.title,
          totalVotes: overview.totalVotes,
          type: overview.type,
        },
        options: optionAnalytics.options,
        winner: optionAnalytics.winner,
        totalVotes: optionAnalytics.totalVotes,
      },
      "Poll results fetched successfully"
    );
  }

  async getChartData(pollId) {
    const chartData = await analyticsRepository.getChartData(pollId);
    if (!chartData) throw new ApiError(404, "Poll not found");
    return Response.success(200, chartData, "Chart data fetched successfully");
  }

  async getDashboardAnalytics(userId) {
    const dashboard = await analyticsRepository.getDashboardAnalytics(userId);
    return Response.success(
      200,
      dashboard,
      "Dashboard analytics fetched successfully"
    );
  }

  async getTrendingPolls() {
    const trending = await analyticsRepository.getTrendingPolls(10);
    return Response.success(
      200,
      { polls: trending },
      "Trending polls fetched successfully"
    );
  }
}

export const analyticsService = new AnalyticsService();
