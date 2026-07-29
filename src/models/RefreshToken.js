import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    hashedRefreshToken: {
      type: String,
      required: [true, "Hashed refresh token is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: { expireAfterSeconds: 0 },
    },
    deviceInfo: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

refreshTokenSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", refreshTokenSchema);
