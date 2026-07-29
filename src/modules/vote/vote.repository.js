import mongoose from "mongoose";
import Vote from "../../models/Vote.js";

class VoteRepository {
  async findVoteByUserAndPoll(userId, pollId) {
    return await Vote.findOne({ userId, pollId });
  }

  async findVoteById(id) {
    return await Vote.findById(id);
  }

  async createVote(voteData) {
    return await Vote.create(voteData);
  }

  async updateVote(voteId, updates) {
    return await Vote.findByIdAndUpdate(voteId, updates, { new: true });
  }

  async deleteVote(voteId) {
    return await Vote.findByIdAndDelete(voteId);
  }

  async deleteVotesByPoll(pollId) {
    return await Vote.deleteMany({ pollId });
  }

  async getVotesByPoll(pollId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Vote.find({ pollId })
      .populate("userId", "name username profileImage")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getVoteCountByOption(pollId) {
    return await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $unwind: "$selectedOptions" },
      { $group: { _id: "$selectedOptions", count: { $sum: 1 } } },
    ]);
  }

  async getUserVoteHistory(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Vote.find({ userId })
      .populate("pollId", "title status type options")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async hasUserVoted(pollId, userId) {
    return await Vote.exists({ pollId, userId });
  }

  async countVotesByPoll(pollId) {
    return await Vote.countDocuments({ pollId });
  }
}

export const voteRepository = new VoteRepository();
