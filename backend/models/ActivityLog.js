const mongoose = require("mongoose")

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: [true, "Please provide action description"],
    },
    resourceType: {
      type: String,
      enum: ["user", "car", "rental", "sale", "forum", "dealership"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("ActivityLog", ActivityLogSchema)
