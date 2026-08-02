import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { organizationRepository } from "./organization.repository.js";

import User from "../../models/User.js";

class OrganizationService {
  async create(adminId, data) {
    const existing = await organizationRepository.findBySlug(data.slug);
    if (existing) throw new ApiError(409, "Organization slug already exists");

    const org = await organizationRepository.create({
      ...data,
      createdBy: adminId,
    });

    await organizationRepository.addMember(org._id, adminId, "owner", adminId);

    return Response.success(
      201,
      { organization: org },
      "Organization created successfully"
    );
  }

  async list(userId, page = 1, limit = 20, search) {
    const result = await organizationRepository.list(
      userId,
      page,
      limit,
      search
    );
    return Response.success(200, result, "Organizations fetched successfully");
  }

  async get(slug, userId) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const isMember = await organizationRepository.isMember(org._id, userId);
    if (!isMember && !org.settings.allowPublicPolls) {
      throw new ApiError(403, "You are not a member of this organization");
    }

    const members = await organizationRepository.getMembers(org._id);
    return Response.success(
      200,
      { organization: org, members },
      "Organization fetched successfully"
    );
  }

  async update(slug, userId, data) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new ApiError(403, "Only admins can update organization");
    }

    const updated = await organizationRepository.update(org._id, data);
    return Response.success(
      200,
      { organization: updated },
      "Organization updated successfully"
    );
  }

  async delete(slug, userId) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member || member.role !== "owner") {
      throw new ApiError(403, "Only owner can delete organization");
    }

    await organizationRepository.delete(org._id);
    return Response.success(200, null, "Organization deleted successfully");
  }

  async inviteMember(slug, userId, data) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new ApiError(403, "Only admins can invite members");
    }

    const user = await User.findOne({ email: data.email });
    if (!user) throw new ApiError(404, "User not found");

    const existingMember = await organizationRepository.getMember(
      org._id,
      user._id
    );
    if (existingMember) throw new ApiError(409, "User is already a member");

    await organizationRepository.addMember(
      org._id,
      user._id,
      data.role || "member",
      userId
    );

    return Response.success(201, null, "Member invited successfully");
  }

  async getMembers(slug, userId) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member)
      throw new ApiError(403, "You are not a member of this organization");

    const members = await organizationRepository.getMembers(org._id);
    return Response.success(200, { members }, "Members fetched successfully");
  }

  async updateMemberRole(slug, userId, targetUserId, role) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new ApiError(403, "Only admins can update member roles");
    }

    const targetMember = await organizationRepository.getMember(
      org._id,
      targetUserId
    );
    if (!targetMember) throw new ApiError(404, "Member not found");

    if (targetMember.role === "owner" && member.role !== "owner") {
      throw new ApiError(403, "Only owner can change owner role");
    }

    await organizationRepository.updateMemberRole(org._id, targetUserId, role);
    return Response.success(200, null, "Member role updated successfully");
  }

  async removeMember(slug, userId, targetUserId) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) throw new ApiError(404, "Organization not found");

    const member = await organizationRepository.getMember(org._id, userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new ApiError(403, "Only admins can remove members");
    }

    const targetMember = await organizationRepository.getMember(
      org._id,
      targetUserId
    );
    if (!targetMember) throw new ApiError(404, "Member not found");

    if (targetMember.role === "owner") {
      throw new ApiError(403, "Cannot remove owner from organization");
    }

    await organizationRepository.removeMember(org._id, targetUserId);
    return Response.success(200, null, "Member removed successfully");
  }
}

export const organizationService = new OrganizationService();
