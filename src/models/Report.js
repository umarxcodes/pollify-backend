import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["poll", "comment", "user"],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "misinformation",
        "inappropriate_content",
        "copyright",
        "fake_account",
        "scam",
        "other",
      ],
      required: [true, "Report reason is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Admin notes must be at most 500 characters"],
      default: "",
    },
    moderationAction: {
      type: String,
      enum: [
        "no_action",
        "delete_poll",
        "delete_comment",
        "suspend_user",
        "warn_user",
        "ban_user",
        "restore_content",
      ],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index(
  { reporterId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
