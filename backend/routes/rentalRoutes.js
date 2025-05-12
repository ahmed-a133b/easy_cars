const express = require("express")
const { getRentals, getRentalById, createRental, cancelRental, deleteRental } = require("../controllers/rentalController")
const { protect, authorize } = require("../middleware/authMiddleware")
const { validateRental } = require("../middleware/validationMiddleware")

const router = express.Router()

router.get("/", protect, getRentals)
router.get("/:id", protect, getRentalById)
router.post("/", protect, validateRental, createRental)
router.put("/:id/cancel", protect, cancelRental)
router.delete("/:id", protect, authorize("admin"), deleteRental)

module.exports = router
