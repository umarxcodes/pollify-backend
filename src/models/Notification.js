import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "WELCOME",
        "EMAIL_VERIFIED",
        "PASSWORD_CHANGED",
        "PASSWORD_RESET",
        "POLL_CREATED",
        "POLL_UPDATED",
        "POLL_DELETED",
        "POLL_EXPIRING",
        "POLL_CLOSED",
        "NEW_VOTE",
        "NEW_COMMENT",
        "COMMENT_REPLY",
        "COMMENT_LIKED",
        "COMMENT_PINNED",
        "BOOKMARK",
        "REPORT_UPDATED",
        "SYSTEM",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message must be at most 1000 characters"],
    },
    entityType: {
      type: String,
      enum: ["poll", "comment", "vote", "user", "system", null],
      default: null,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, type: 1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
