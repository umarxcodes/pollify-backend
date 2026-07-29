import mongoose, { Schema } from "mongoose";

const commentLikeSchema = new Schema(
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export default mongoose.models.CommentLike ||
  mongoose.model("CommentLike", commentLikeSchema);
