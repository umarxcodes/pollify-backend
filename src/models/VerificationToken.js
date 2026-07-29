import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { hashOTP } from "../utils/otp.util.js";

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
    plainOtp: {
      type: String,
      required: [true, "Plain OTP is required"],
      select: false, // Never return in API responses
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum verification attempts exceeded"],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash OTP before saving to the database
verificationTokenSchema.pre("save", async function () {
  if (this.isModified("plainOtp")) {
    this.hashedOtp = await hashOTP(this.plainOtp);
  }
});

// Instance method to verify candidate OTP against stored hash
verificationTokenSchema.methods.compareOtp = async function (candidateOtp) {
  return await bcrypt.compare(candidateOtp, this.hashedOtp);
};

export default mongoose.models.VerificationToken ||
  mongoose.model("VerificationToken", verificationTokenSchema);
