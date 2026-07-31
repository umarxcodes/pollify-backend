import mongoose, { Schema } from "mongoose";

const searchHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entries: {
      type: [
        {
          query: { type: String, required: true },
          resultsCount: { type: Number, default: 0 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

searchHistorySchema.index({ userId: 1, "entries.createdAt": -1 });

export default mongoose.models.SearchHistory ||
  mongoose.model("SearchHistory", searchHistorySchema);
