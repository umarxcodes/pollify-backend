import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import Vote from "../../models/Vote.js";
import { voteRepository } from "./vote.repository.js";
import Poll from "../../models/Poll.js";

class VoteService {
  async castVote(
    userId,
    pollId,
    selectedOptions,
    isAnonymous,
    ipAddress,
    userAgent
  ) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    if (poll.status !== "active") throw new ApiError(403, "Poll is not active");

    if (poll.expiresAt && new Date() > poll.expiresAt)
      throw new ApiError(410, "Poll has expired");

    const existingVote = await voteRepository.findVoteByUserAndPoll(
      userId,
      pollId
    );
    if (existingVote)
      throw new ApiError(409, "You have already voted on this poll");

    if (!this.validateOptions(poll, selectedOptions)) {
      throw new ApiError(400, "Invalid options selected");
    }

    const vote = await voteRepository.createVote({
      userId,
      pollId,
      selectedOptions,
      isAnonymous: isAnonymous || false,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
    });

    await this.updatePollStats(pollId, selectedOptions);

    return Response.success(201, { vote }, "Vote cast successfully");
  }

  async changeVote(userId, pollId, newSelectedOptions) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (poll.status !== "active") throw new ApiError(403, "Poll is not active");
    if (!poll.allowVoteChange)
      throw new ApiError(403, "Vote change is not allowed for this poll");

    const existingVote = await voteRepository.findVoteByUserAndPoll(
      userId,
      pollId
    );
    if (!existingVote)
      throw new ApiError(404, "You have not voted on this poll yet");

    if (!this.validateOptions(poll, newSelectedOptions)) {
      throw new ApiError(400, "Invalid options selected");
    }

    await this.revertPollStats(pollId, existingVote.selectedOptions);

    const updatedVote = await voteRepository.updateVote(existingVote._id, {
      selectedOptions: newSelectedOptions,
    });

    await this.updatePollStats(pollId, newSelectedOptions);

    return Response.success(
      200,
      { vote: updatedVote },
      "Vote changed successfully"
    );
  }

  async removeVote(userId, pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const existingVote = await voteRepository.findVoteByUserAndPoll(
      userId,
      pollId
    );
    if (!existingVote)
      throw new ApiError(404, "You have not voted on this poll");

    await this.revertPollStats(pollId, existingVote.selectedOptions);
    await voteRepository.deleteVote(existingVote._id);

    return Response.success(200, null, "Vote removed successfully");
  }

  async getMyVote(userId, pollId) {
    const vote = await voteRepository.findVoteByUserAndPoll(userId, pollId);
    if (!vote) throw new ApiError(404, "You have not voted on this poll");
    return Response.success(200, { vote }, "Vote fetched successfully");
  }

  async getPollVoters(pollId, page = 1, limit = 20) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");
    if (poll.type === "anonymous")
      throw new ApiError(403, "Voters are hidden for anonymous polls");

    const votes = await voteRepository.getVotesByPoll(pollId, page, limit);
    const total = await voteRepository.countVotesByPoll(pollId);

    return Response.success(
      200,
      {
        voters: votes,
        pagination: { page, limit, total },
      },
      "Poll voters fetched successfully"
    );
  }

  async getPollResults(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const optionVoteCounts = await voteRepository.getVoteCountByOption(pollId);

    const optionResults = poll.options.map((option) => {
      const voteCount =
        optionVoteCounts.find((item) => item._id === option._id?.toString())
          ?.count || 0;
      const percentage =
        poll.totalVotes > 0
          ? Math.round((voteCount / poll.totalVotes) * 100)
          : 0;
      return {
        optionId: option._id,
        text: option.text,
        votes: voteCount,
        percentage,
      };
    });

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

  async getUserVoteHistory(userId, page = 1, limit = 20) {
    const votes = await voteRepository.getUserVoteHistory(userId, page, limit);
    const total = await Vote.countDocuments({ userId });

    return Response.success(
      200,
      {
        votes,
        pagination: { page, limit, total },
      },
      "Vote history fetched successfully"
    );
  }

  async getPollStats(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const totalVotes = await voteRepository.countVotesByPoll(pollId);
    const daysActive = Math.max(
      1,
      Math.ceil((new Date() - poll.createdAt) / (1000 * 60 * 60 * 24))
    );
    const avgVotesPerDay = totalVotes / daysActive;

    return Response.success(
      200,
      {
        pollId: poll._id,
        totalVotes,
        uniqueVoters: totalVotes,
        avgVotesPerDay: Math.round(avgVotesPerDay * 100) / 100,
        daysActive,
        participationRate: 0,
        createdAt: poll.createdAt,
        lastVoteAt: poll.lastVoteAt,
      },
      "Poll statistics fetched successfully"
    );
  }

  async updatePollStats(pollId, selectedOptions) {
    const poll = await Poll.findById(pollId);
    if (!poll) return;

    poll.totalVotes = (poll.totalVotes || 0) + 1;
    poll.lastVoteAt = new Date();

    for (const optionId of selectedOptions) {
      const option = poll.options.id(optionId);
      if (option) {
        option.votes = (option.votes || 0) + 1;
      }
    }

    await poll.save();
  }

  async revertPollStats(pollId, selectedOptions) {
    const poll = await Poll.findById(pollId);
    if (!poll) return;

    poll.totalVotes = Math.max(0, (poll.totalVotes || 0) - 1);

    for (const optionId of selectedOptions) {
      const option = poll.options.id(optionId);
      if (option && option.votes > 0) {
        option.votes -= 1;
      }
    }

    await poll.save();
  }

  validateOptions(poll, selectedOptions) {
    if (!selectedOptions || selectedOptions.length === 0) return false;

    const validOptionIds = poll.options.map((opt) => opt._id?.toString());
    const isValid = selectedOptions.every((id) => validOptionIds.includes(id));

    if (poll.type === "single" && selectedOptions.length > 1) return false;

    return isValid;
  }
}

export const voteService = new VoteService();
