const ForumPost = require("../models/ForumPost")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { category, search } = req.query

    // Build query
    const query = {}

    if (category) query.category = category
    if (search) query.title = { $regex: search, $options: "i" }

    const posts = await ForumPost.find(query)
      .populate({
        path: "user",
        select: "name",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single forum post
// @route   GET /api/forum/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "comments.user",
        select: "name",
      })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    res.status(200).json({
      success: true,
      data: post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new forum post
// @route   POST /api/forum
// @access  Private
exports.createPost = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id

    const post = await ForumPost.create(req.body)

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Forum post created",
      resourceType: "forum",
      resourceId: post._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add comment to forum post
// @route   POST /api/forum/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide comment text",
      })
    }

    const post = await ForumPost.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Add comment
    post.comments.push({
      user: req.user.id,
      text,
    })

    await post.save()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Comment added to forum post",
      resourceType: "forum",
      resourceId: post._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Like/unlike forum post
// @route   PUT /api/forum/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if post has already been liked by user
    const upvoteIndex = post.upvotes.findIndex((id) => id.toString() === req.user.id)

    const downvoteIndex = post.downvotes.findIndex((id) => id.toString() === req.user.id)

    // Handle upvote/downvote logic
    if (req.body.action === "upvote") {
      if (upvoteIndex === -1) {
        // Add upvote
        post.upvotes.push(req.user.id)

        // Remove downvote if exists
        if (downvoteIndex !== -1) {
          post.downvotes.splice(downvoteIndex, 1)
        }
      } else {
        // Remove upvote (toggle)
        post.upvotes.splice(upvoteIndex, 1)
      }
    } else if (req.body.action === "downvote") {
      if (downvoteIndex === -1) {
        // Add downvote
        post.downvotes.push(req.user.id)

        // Remove upvote if exists
        if (upvoteIndex !== -1) {
          post.upvotes.splice(upvoteIndex, 1)
        }
      } else {
        // Remove downvote (toggle)
        post.downvotes.splice(downvoteIndex, 1)
      }
    }

    await post.save()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: `Post ${req.body.action}d`,
      resourceType: "forum",
      resourceId: post._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete forum post
// @route   DELETE /api/forum/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Only post creator or admin can delete
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this post",
      })
    }

    await ForumPost.deleteOne({ _id: req.params.id });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Forum post deleted",
      resourceType: "forum",
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
