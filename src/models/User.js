import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
      match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be at most 20 characters"],
      match: [
        /^[a-zA-Z0-9_.]+$/,
        "Username can only contain letters, numbers, underscore and dot",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude from query results by default
    },
    profileImage: {
      type: String,
      default:
        env.defaultAvatarUrl ||
        "https://res.cloudinary.com/dlul8f6xz/image/upload/v1/default_avatar",
    },
    bio: {
      type: String,
      maxlength: [300, "Bio must be at most 300 characters"],
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "super_admin"],
      default: "user",
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true, // Frequent filter for auth checks
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginActivity: {
      type: [
        {
          timestamp: Date,
          ipAddress: String,
          userAgent: String,
        },
      ],
      default: [],
      maxlength: [50, "Login activity cannot exceed 50 entries"],
    },
    notificationPreferences: {
      type: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        voteNotifications: { type: Boolean, default: true },
        commentNotifications: { type: Boolean, default: true },
        pollNotifications: { type: Boolean, default: true },
        systemNotifications: { type: Boolean, default: true },
        marketingNotifications: { type: Boolean, default: false },
      },
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

// Auto-hash password before saving (only when password is new/modified)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

// Text index for user search
userSchema.index({ username: "text", name: "text" });

// Instance method to compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
