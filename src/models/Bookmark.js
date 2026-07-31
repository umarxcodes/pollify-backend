import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
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

bookmarkSchema.index({ userId: 1, pollId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ pollId: 1, createdAt: -1 });

export default mongoose.models.Bookmark ||
  mongoose.model("Bookmark", bookmarkSchema);
