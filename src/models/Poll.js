import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 },
  },
  { _id: true, strict: true, strictQuery: true }
);

const pollSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
      default: "",
    },
    options: {
      type: [optionSchema],
      required: [true, "At least one option is required"],
      validate: {
        validator: function (v) {
          return v && v.length >= 2;
        },
        message: "At least two options are required",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "expired", "deleted"],
      default: "active",
      index: true,
    },
    type: {
      type: String,
      enum: ["single", "multiple", "anonymous"],
      default: "single",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    allowVoteChange: {
      type: Boolean,
      default: false,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Expiry must be in the future",
      },
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    lastVoteAt: {
      type: Date,
      default: null,
    },
    savedCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
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

pollSchema.index({ createdBy: 1, status: 1 });
pollSchema.index({ status: 1, expiresAt: 1 });
pollSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});

export default mongoose.models.Poll || mongoose.model("Poll", pollSchema);
