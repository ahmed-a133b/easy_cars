const express = require("express")
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getFeaturedCars,
  addBinaryImageToCar,
  getBinaryImage,
  getMyListings
} = require("../controllers/carController")
const { protect, authorize } = require("../middleware/authMiddleware")
const { validateCarInput } = require("../middleware/validationMiddleware")

const router = express.Router()

router.get("/", getCars)
router.get("/featured", getFeaturedCars) // moved this ABOVE `/:id`
router.get("/my-listings", protect, getMyListings)
router.get("/images/:imageId", getBinaryImage) // Retrieves binary image by ID
router.get("/:id", getCarById)

router.post("/", protect, authorize("dealership_manager", "admin"), validateCarInput, createCar)
router.post("/:id/images", protect, authorize("dealership_manager", "admin"), addBinaryImageToCar)
router.put("/:id", protect, authorize("dealership_manager", "admin"), validateCarInput, updateCar)
router.delete("/:id", protect, authorize("dealership_manager", "admin"), deleteCar)

module.exports = router
