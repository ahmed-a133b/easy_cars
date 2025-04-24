const express = require("express")
const { getSales, createSale } = require("../controllers/saleController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", protect, getSales)
router.post("/", protect, createSale)

module.exports = router
