import mongoose from "mongoose";
import Poll from "../../models/Poll.js";
import Vote from "../../models/Vote.js";

class PollRepository {
  async create(data) {
    return Poll.create(data);
  }

  async findById(id) {
    return await Poll.findById(id).populate(
      "createdBy",
      "name username profileImage"
    );
  }

  async find(filters = {}, sort = { createdAt: -1 }, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Poll.find(filters)
      .populate("createdBy", "name username profileImage")
      .skip(skip)
      .limit(limit)
      .sort(sort);
  }

  async findByIdAndUpdate(id, updates) {
    return await Poll.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("createdBy", "name username profileImage");
  }

  async softDelete(id) {
    return await Poll.findByIdAndUpdate(
      id,
      { $set: { status: "deleted" } },
      { new: true }
    ).populate("createdBy", "name username profileImage");
  }

  async countDocuments(filters = {}) {
    return await Poll.countDocuments(filters);
  }

  async getPollResults(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    const optionVoteCounts = await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $unwind: "$selectedOptions" },
      { $group: { _id: "$selectedOptions", count: { $sum: 1 } } },
    ]);

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

    return { poll, optionResults };
  }
}

export const pollRepository = new PollRepository();
