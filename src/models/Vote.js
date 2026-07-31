import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
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
    selectedOptions: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one option must be selected",
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

voteSchema.index({ pollId: 1, userId: 1 }, { unique: true });
voteSchema.index({ userId: 1, createdAt: -1 });
voteSchema.index({ pollId: 1, createdAt: -1 });

export default mongoose.models.Vote || mongoose.model("Vote", voteSchema);
