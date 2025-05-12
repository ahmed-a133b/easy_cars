const express = require("express")
const { 
  getSales, 
  createSale,
  deleteSale
} = require("../controllers/saleController")
const { protect, authorize } = require("../middleware/authMiddleware")
const { validateSale } = require("../middleware/validationMiddleware")

const router = express.Router()

router.get("/", protect, getSales)
router.post("/", protect, validateSale, createSale)
router.delete("/:id", protect, authorize("admin"), deleteSale)

module.exports = router
