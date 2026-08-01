import { organizationService } from "./organization.service.js";

class OrganizationController {
  static async create(req, res, next) {
    try {
      const result = await organizationService.create(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const result = await organizationService.list(req.user.id, page, limit, search);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async get(req, res, next) {
    try {
      const result = await organizationService.get(req.params.slug, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await organizationService.update(req.params.slug, req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await organizationService.delete(req.params.slug, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req, res, next) {
    try {
      const result = await organizationService.inviteMember(req.params.slug, req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req, res, next) {
    try {
      const result = await organizationService.getMembers(req.params.slug, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req, res, next) {
    try {
      const result = await organizationService.updateMemberRole(req.params.slug, req.user.id, req.params.userId, req.body.role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req, res, next) {
    try {
      const result = await organizationService.removeMember(req.params.slug, req.user.id, req.params.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default OrganizationController;
