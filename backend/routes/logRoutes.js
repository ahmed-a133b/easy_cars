const express = require("express")
const { getLogs } = require("../controllers/logController")
const { protect } = require("../middleware/authMiddleware")
const { adminOnly } = require("../middleware/adminMiddleware")

const router = express.Router()

router.get("/", protect, adminOnly, getLogs)

module.exports = router
