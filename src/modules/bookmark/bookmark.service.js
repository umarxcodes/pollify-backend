import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { bookmarkRepository } from "./bookmark.repository.js";

class BookmarkService {
  async savePoll(userId, pollId) {
    const poll = await bookmarkRepository.getPollById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const existing = await bookmarkRepository.findBookmark(userId, pollId);
    if (existing) throw new ApiError(409, "Poll already saved");

    try {
      await bookmarkRepository.createBookmark(userId, pollId);
    } catch (error) {
      if (error?.code === 11000) {
        throw new ApiError(409, "Poll already saved");
      }
      throw error;
    }
    await bookmarkRepository.incrementPollSavedCount(pollId, 1);

    const bookmark = await bookmarkRepository.findBookmark(userId, pollId);

    return Response.success(201, { bookmark }, "Poll saved successfully");
  }

  async removeBookmark(userId, pollId) {
    const existing = await bookmarkRepository.findBookmark(userId, pollId);
    if (!existing) throw new ApiError(404, "Bookmark not found");

    await bookmarkRepository.deleteBookmark(userId, pollId);
    await bookmarkRepository.incrementPollSavedCount(pollId, -1);

    return Response.success(200, null, "Bookmark removed successfully");
  }

  async checkBookmarkStatus(userId, pollId) {
    if (!userId)
      return Response.success(200, { saved: false }, "Bookmark status fetched");
    const exists = await bookmarkRepository.hasUserBookmarked(userId, pollId);
    return Response.success(200, { saved: exists }, "Bookmark status fetched");
  }

  async getMyBookmarks(userId, page = 1, limit = 20, sort = "newest") {
    const bookmarks = await bookmarkRepository.getUserBookmarks(
      userId,
      page,
      limit,
      sort
    );
    const total = await bookmarkRepository.countUserBookmarks(userId);

    const enriched = bookmarks
      .map((b) => {
        const poll = b.pollId;
        if (!poll) return null;

        const enrichedPoll = {
          ...poll.toObject(),
          creator: poll.createdBy,
          commentCount: 0,
          voteCount: poll.totalVotes || 0,
        };

        return {
          id: b._id,
          poll: enrichedPoll,
          savedAt: b.createdAt,
        };
      })
      .filter(Boolean);

    return Response.success(
      200,
      {
        bookmarks: enriched,
        pagination: { page, limit, total },
      },
      "Bookmarks fetched successfully"
    );
  }

  async getBookmarkStats(userId) {
    const totalSaved = await bookmarkRepository.countUserBookmarks(userId);
    const mostSavedCategory =
      await bookmarkRepository.getMostSavedCategory(userId);
    const mostPopularSavedPoll =
      await bookmarkRepository.getMostPopularSavedPoll(userId);
    const recentlySavedPoll =
      await bookmarkRepository.getRecentlySavedPoll(userId);

    return Response.success(
      200,
      {
        totalSavedPolls: totalSaved,
        mostSavedCategory,
        mostPopularSavedPoll,
        recentlySavedPoll,
      },
      "Bookmark statistics fetched successfully"
    );
  }
}

export const bookmarkService = new BookmarkService();
