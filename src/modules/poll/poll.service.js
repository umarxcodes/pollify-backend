import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { pollRepository } from "./poll.repository.js";

class PollService {
  async createPoll(userId, data) {
    const poll = await pollRepository.create({
      ...data,
      createdBy: userId,
    });

    const populatedPoll = await pollRepository.findById(poll._id);
    return Response.success(
      201,
      { poll: populatedPoll },
      "Poll created successfully"
    );
  }

  async getPollById(pollId) {
    const poll = await pollRepository.findById(pollId);
    if (!poll || poll.status === "deleted") {
      throw new ApiError(404, "Poll not found");
    }
    return Response.success(200, { poll }, "Poll fetched successfully");
  }

  async getPolls(filters = {}, sort = "newest", page = 1, limit = 20) {
    const { filter, search, category } = filters;

    let query = { status: { $ne: "deleted" } };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};

    if (filter) {
      switch (filter) {
        case "latest":
          sortOption = { createdAt: -1 };
          break;
        case "trending":
          sortOption = { totalVotes: -1, createdAt: -1 };
          break;
        case "popular":
          sortOption = { totalVotes: -1, savedCount: -1 };
          break;
        case "ending-soon":
          query.expiresAt = { $gte: new Date() };
          sortOption = { expiresAt: 1 };
          break;
      }
    } else if (sort) {
      if (sort === "newest") sortOption = { createdAt: -1 };
      else if (sort === "oldest") sortOption = { createdAt: 1 };
      else if (sort === "popular") sortOption = { totalVotes: -1 };
      else if (sort === "ending-soon") {
        query.expiresAt = { $gte: new Date() };
        sortOption = { expiresAt: 1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    const [polls, total] = await Promise.all([
      pollRepository.find(query, sortOption, page, limit),
      pollRepository.countDocuments(query),
    ]);

    return Response.success(
      200,
      {
        polls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
        },
      },
      "Polls fetched successfully"
    );
  }

  async updatePoll(pollId, userId, data) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (data.options && poll.totalVotes > 0) {
      throw new ApiError(
        409,
        "Poll options cannot be changed after voting has started"
      );
    }

    const updatedPoll = await pollRepository.findByIdAndUpdate(pollId, data);
    return Response.success(
      200,
      { poll: updatedPoll },
      "Poll updated successfully"
    );
  }

  async deletePoll(pollId, _userId) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const deletedPoll = await pollRepository.softDelete(pollId);
    return Response.success(
      200,
      { poll: deletedPoll },
      "Poll deleted successfully"
    );
  }

  async getPollResults(pollId) {
    const result = await pollRepository.getPollResults(pollId);
    if (!result) throw new ApiError(404, "Poll not found");

    const { poll, optionResults } = result;
    const winner = optionResults.reduce(
      (max, option) => (option.votes > max.votes ? option : max),
      optionResults[0]
    );

    return Response.success(
      200,
      {
        poll: {
          id: poll._id,
          title: poll.title,
          totalVotes: poll.totalVotes,
          type: poll.type,
        },
        options: optionResults,
        winner: poll.totalVotes > 0 ? winner : null,
        totalVotes: poll.totalVotes,
      },
      "Poll results fetched successfully"
    );
  }
}

export const pollService = new PollService();
