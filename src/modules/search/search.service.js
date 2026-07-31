import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { searchRepository } from "./search.repository.js";

class SearchService {
  async globalSearch(query, userId = null) {
    const [pollsResult, usersResult, categoriesResult] = await Promise.all([
      searchRepository.searchPolls(query, {}, "newest", 1, 5),
      searchRepository.searchUsers(query, 1, 5),
      searchRepository.getCategories(query, 1, 5),
    ]);

    if (userId) {
      await searchRepository.addSearchHistory(
        userId,
        query,
        pollsResult.total + usersResult.total
      );
    }

    return Response.success(
      200,
      {
        polls: pollsResult.polls,
        users: usersResult.users,
        categories: categoriesResult.categories,
      },
      "Global search completed successfully"
    );
  }

  async searchPolls(
    query,
    filters = {},
    sort = "newest",
    page = 1,
    limit = 20,
    userId = null
  ) {
    const result = await searchRepository.searchPolls(
      query,
      filters,
      sort,
      page,
      limit
    );

    if (userId) {
      await searchRepository.addSearchHistory(userId, query, result.total);
    }

    return Response.success(
      200,
      {
        polls: result.polls,
        pagination: { page, limit, total: result.total },
      },
      "Polls search completed successfully"
    );
  }

  async searchUsers(query, page = 1, limit = 20) {
    const result = await searchRepository.searchUsers(query, page, limit);
    return Response.success(
      200,
      {
        users: result.users,
        pagination: { page, limit, total: result.total },
      },
      "Users search completed successfully"
    );
  }

  async searchCategories(query, page = 1, limit = 20) {
    const result = await searchRepository.getCategories(query, page, limit);
    return Response.success(
      200,
      { categories: result.categories },
      "Categories fetched successfully"
    );
  }

  async getTrendingPolls() {
    const polls = await searchRepository.getTrendingPolls(10);
    return Response.success(
      200,
      { polls },
      "Trending polls fetched successfully"
    );
  }

  async getPopularPolls(sortBy = "votes") {
    const polls = await searchRepository.getPopularPolls(10, sortBy);
    return Response.success(
      200,
      { polls },
      "Popular polls fetched successfully"
    );
  }

  async getLatestPolls() {
    const polls = await searchRepository.getLatestPolls(10);
    return Response.success(
      200,
      { polls },
      "Latest polls fetched successfully"
    );
  }

  async getEndingSoonPolls() {
    const polls = await searchRepository.getEndingSoonPolls(10);
    return Response.success(
      200,
      { polls },
      "Ending soon polls fetched successfully"
    );
  }

  async getRecommendedPolls(userId) {
    const polls = await searchRepository.getRecommendedPolls(userId, 10);
    return Response.success(
      200,
      { polls },
      "Recommended polls fetched successfully"
    );
  }

  async getRecentlyViewed(userId) {
    const polls = await searchRepository.getRecentlyViewed(userId, 20);
    return Response.success(
      200,
      { polls },
      "Recently viewed polls fetched successfully"
    );
  }

  async addRecentlyViewed(userId, pollId) {
    await searchRepository.addRecentlyViewed(userId, pollId);
    return Response.success(200, null, "Poll added to recently viewed");
  }

  async getSearchHistory(userId, page = 1, limit = 20) {
    const result = await searchRepository.getSearchHistory(userId, page, limit);
    return Response.success(
      200,
      {
        history: result.history,
        pagination: { page, limit, total: result.total },
      },
      "Search history fetched successfully"
    );
  }

  async deleteSearchHistoryItem(userId, historyId) {
    const deleted = await searchRepository.deleteSearchHistoryItem(
      userId,
      historyId
    );
    if (!deleted) throw new ApiError(404, "Search history item not found");
    return Response.success(
      200,
      null,
      "Search history item deleted successfully"
    );
  }

  async deleteAllSearchHistory(userId) {
    await searchRepository.deleteAllSearchHistory(userId);
    return Response.success(
      200,
      null,
      "All search history deleted successfully"
    );
  }

  async getSearchSuggestions(query) {
    const suggestions = await searchRepository.getSearchSuggestions(query);
    return Response.success(
      200,
      suggestions,
      "Search suggestions fetched successfully"
    );
  }
}

export const searchService = new SearchService();
