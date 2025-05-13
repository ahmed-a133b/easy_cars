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
router.get("/featured", getFeaturedCars)
router.get("/my-listings", protect, getMyListings)
router.get("/images/:imageId", getBinaryImage)
router.get("/:id", getCarById)

router.post("/", protect, validateCarInput, createCar)
router.post("/:id/images", protect, addBinaryImageToCar)
router.put("/:id", protect, validateCarInput, updateCar)
router.delete("/:id", protect, deleteCar)

module.exports = router
