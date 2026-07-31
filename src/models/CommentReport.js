import mongoose, { Schema } from "mongoose";

const commentReportSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "abuse", "hate_speech", "other"],
      required: [true, "Report reason is required"],
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
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

commentReportSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export default mongoose.models.CommentReport ||
  mongoose.model("CommentReport", commentReportSchema);
