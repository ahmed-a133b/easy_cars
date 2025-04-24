const express = require("express")
const { getCars, getCarById, createCar, updateCar, deleteCar, getFeaturedCars } = require("../controllers/carController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", getCars)
router.get("/:id", getCarById)
router.get("/featured", getFeaturedCars)
router.post("/", protect, authorize("dealership_manager", "admin"), createCar)
router.put("/:id", protect, authorize("dealership_manager", "admin"), updateCar)
router.delete("/:id", protect, authorize("dealership_manager", "admin"), deleteCar)


module.exports = router
