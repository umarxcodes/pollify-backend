import mongoose, { Schema } from "mongoose";
import { env } from "../../config/env.js";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description must be at most 500 characters"],
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settings: {
      allowPublicPolls: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      maxMembers: { type: Number, default: 50 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

organizationSchema.index({ name: "text", slug: "text" });

export default mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
