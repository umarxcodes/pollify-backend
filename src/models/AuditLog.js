import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [100, "Action must be at most 100 characters"],
    },
    targetType: {
      type: String,
      enum: [
        "user",
        "poll",
        "comment",
        "category",
        "report",
        "system",
        "notification",
      ],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
