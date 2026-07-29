import mongoose, { Schema } from "mongoose";

const searchHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: [true, "Search query is required"],
      trim: true,
      maxlength: [200, "Query must be at most 200 characters"],
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.SearchHistory ||
  mongoose.model("SearchHistory", searchHistorySchema);
