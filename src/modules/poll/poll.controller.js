import { pollService } from "./poll.service.js";

class PollController {
  static async getPolls(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filter = req.query.filter || "";
      const sort = req.query.sort || "";
      const search = req.query.search || "";
      const category = req.query.category || "";

      const result = await pollService.getPolls(
        { filter, search, category },
        sort,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollById(req, res, next) {
    try {
      const result = await pollService.getPollById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createPoll(req, res, next) {
    try {
      const result = await pollService.createPoll(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePoll(req, res, next) {
    try {
      const result = await pollService.updatePoll(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePoll(req, res, next) {
    try {
      const result = await pollService.deletePoll(req.params.id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollResults(req, res, next) {
    try {
      const result = await pollService.getPollResults(req.params.pollId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PollController;
