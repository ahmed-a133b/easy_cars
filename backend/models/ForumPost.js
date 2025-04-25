const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Please provide comment text"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const ForumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide post title"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide post content"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["General", "Question", "Car Reviews", "Buying Advice", "Selling Tips", "Maintenance", "Other"],
      default: "General",
    },
    comments: [CommentSchema],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("ForumPost", ForumPostSchema)
