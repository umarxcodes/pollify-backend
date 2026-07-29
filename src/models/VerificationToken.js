import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const verificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
      unique: true, // One active OTP per user
    },
    hashedOtp: {
      type: String,
      required: [true, "Hashed OTP is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Instance method to verify candidate OTP against stored hash
verificationTokenSchema.methods.compareOtp = async function (candidateOtp) {
  return await bcrypt.compare(candidateOtp, this.hashedOtp);
};

export default mongoose.models.VerificationToken ||
  mongoose.model("VerificationToken", verificationTokenSchema);
