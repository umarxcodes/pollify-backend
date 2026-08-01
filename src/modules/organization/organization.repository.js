import Organization from "../../models/Organization.js";
import OrganizationMember from "../../models/OrganizationMember.js";
import User from "../../models/User.js";

class OrganizationRepository {
  async create(data) {
    return await Organization.create(data);
  }

  async findBySlug(slug) {
    return await Organization.findOne({ slug }).lean();
  }

  async findById(id) {
    return await Organization.findById(id).lean();
  }

  async list(userId, page = 1, limit = 20, search) {
    const skip = (page - 1) * limit;
    let query = {};

    const memberOrgs = await OrganizationMember.find({ user: userId, isActive: true }).select("organization").lean();
    const orgIds = memberOrgs.map((m) => m.organization);

    query._id = { $in: orgIds };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const organizations = await Organization.find(query)
      .populate("createdBy", "name username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(query);

    return { organizations, total, page, limit };
  }

  async update(id, data) {
    return await Organization.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    await OrganizationMember.deleteMany({ organization: id });
    return await Organization.findByIdAndDelete(id);
  }

  async addMember(orgId, userId, role, invitedBy) {
    return await OrganizationMember.create({
      organization: orgId,
      user: userId,
      role,
      invitedBy,
    });
  }

  async getMember(orgId, userId) {
    return await OrganizationMember.findOne({ organization: orgId, user: userId }).lean();
  }

  async getMembers(orgId) {
    return await OrganizationMember.find({ organization: orgId })
      .populate("user", "name username email profileImage")
      .populate("invitedBy", "name username")
      .lean();
  }

  async updateMemberRole(orgId, userId, role) {
    return await OrganizationMember.findOneAndUpdate(
      { organization: orgId, user: userId },
      { role },
      { new: true }
    );
  }

  async removeMember(orgId, userId) {
    return await OrganizationMember.findOneAndDelete({ organization: orgId, user: userId });
  }

  async isMember(orgId, userId) {
    const member = await OrganizationMember.findOne({ organization: orgId, user: userId, isActive: true });
    return !!member;
  }

  async getMemberCount(orgId) {
    return await OrganizationMember.countDocuments({ organization: orgId, isActive: true });
  }
}

export const organizationRepository = new OrganizationRepository();
