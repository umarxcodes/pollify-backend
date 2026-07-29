import mongoose, { Schema } from "mongoose";

const recentlyViewedSchema = new Schema(
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
  }
);

recentlyViewedSchema.index({ userId: 1, createdAt: -1 });
recentlyViewedSchema.index({ userId: 1, pollId: 1 }, { unique: true });

export default mongoose.models.RecentlyViewed ||
  mongoose.model("RecentlyViewed", recentlyViewedSchema);
