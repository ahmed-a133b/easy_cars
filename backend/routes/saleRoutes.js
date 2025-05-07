const express = require("express")
const { getSales, createSale } = require("../controllers/saleController")
const { protect } = require("../middleware/authMiddleware")
const { validateSale } = require("../middleware/validationMiddleware")

const router = express.Router()

router.get("/", protect, getSales)
router.post("/", protect, validateSale, createSale)

module.exports = router
