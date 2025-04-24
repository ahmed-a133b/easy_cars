const express = require("express")
const { getRentals, getRentalById, createRental, cancelRental } = require("../controllers/rentalController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", protect, getRentals)
router.get("/:id", protect, getRentalById)
router.post("/", protect, createRental)
router.put("/:id/cancel", protect, cancelRental)

module.exports = router
