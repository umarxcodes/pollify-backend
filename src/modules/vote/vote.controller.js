import { voteService } from "./vote.service.js";

class VoteController {
  static async castVote(req, res, next) {
    try {
      const result = await voteService.castVote(
        req.user.id,
        req.params.pollId,
        req.body.options,
        req.body.isAnonymous || false,
        req.ip,
        req.get("user-agent")
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async changeVote(req, res, next) {
    try {
      const result = await voteService.changeVote(
        req.user.id,
        req.params.pollId,
        req.body.options
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async removeVote(req, res, next) {
    try {
      const result = await voteService.removeVote(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyVote(req, res, next) {
    try {
      const result = await voteService.getMyVote(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollVoters(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await voteService.getPollVoters(
        req.params.pollId,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollResults(req, res, next) {
    try {
      const result = await voteService.getPollResults(req.params.pollId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserVoteHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await voteService.getUserVoteHistory(
        req.user.id,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollStats(req, res, next) {
    try {
      const result = await voteService.getPollStats(req.params.pollId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default VoteController;
