import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character"],
      maxlength: [1000, "Comment must be at most 1000 characters"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    originalContent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ pollId: 1, parentCommentId: 1, createdAt: -1 });
commentSchema.index({ pollId: 1, isPinned: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({
  pollId: 1,
  parentCommentId: 1,
  isDeleted: 1,
  createdAt: -1,
});

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);
