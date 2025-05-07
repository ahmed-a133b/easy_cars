const express = require("express")
const { getPosts, getPostById, createPost, addComment, likePost } = require("../controllers/forumController")
const { protect } = require("../middleware/authMiddleware")
const { validateForumPost, validateComment } = require("../middleware/validationMiddleware")

const router = express.Router()

router.get("/", getPosts)
router.get("/:id", getPostById)
router.post("/", protect, validateForumPost, createPost)
router.post("/:id/comments", protect, validateComment, addComment)
router.put("/:id/like", protect, likePost)

module.exports = router
