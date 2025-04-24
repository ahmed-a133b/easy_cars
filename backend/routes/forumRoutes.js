const express = require("express")
const { getPosts, getPostById, createPost, addComment, likePost } = require("../controllers/forumController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", getPosts)
router.get("/:id", getPostById)
router.post("/", protect, createPost)
router.post("/:id/comments", protect, addComment)
router.put("/:id/like", protect, likePost)

module.exports = router
