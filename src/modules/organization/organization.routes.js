import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import OrganizationController from "./organization.controller.js";
import {
  createOrganizationValidation,
  updateOrganizationValidation,
  getOrganizationValidation,
  listOrganizationsValidation,
  inviteMemberValidation,
  removeMemberValidation,
  updateMemberRoleValidation,
} from "./organization.validation.js";

const router = Router();

const orgLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many organization requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", authenticate, orgLimiter, validate(createOrganizationValidation), OrganizationController.create);
router.get("/", authenticate, orgLimiter, validate(listOrganizationsValidation), OrganizationController.list);
router.get("/:slug", authenticate, orgLimiter, validate(getOrganizationValidation), OrganizationController.get);
router.patch("/:slug", authenticate, orgLimiter, validate(updateOrganizationValidation), OrganizationController.update);
router.delete("/:slug", authenticate, orgLimiter, validate(getOrganizationValidation), OrganizationController.delete);

router.post("/:slug/members", authenticate, orgLimiter, validate(inviteMemberValidation), OrganizationController.inviteMember);
router.get("/:slug/members", authenticate, orgLimiter, validate(getOrganizationValidation), OrganizationController.getMembers);
router.patch("/:slug/members/:userId", authenticate, orgLimiter, validate(updateMemberRoleValidation), OrganizationController.updateMemberRole);
router.delete("/:slug/members/:userId", authenticate, orgLimiter, validate(removeMemberValidation), OrganizationController.removeMember);

export default router;
