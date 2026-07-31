import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name must be at most 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description must be at most 200 characters"],
      default: "",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    pollCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    strictQuery: true,
  }
);

categorySchema.index({ name: "text", description: "text" });

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
