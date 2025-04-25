const express = require("express")
const {
  getUserById,
  updateProfile,
  getAllUsers,
  deleteUser,
  getUserRentals,
  getUserSales,
} = require("../controllers/userController")
const { protect, authorize } = require("../middleware/authMiddleware")
const { adminOnly } = require("../middleware/adminMiddleware")

const router = express.Router()

router.post("/register", register)
router.get("/:id", protect, getUserById)
router.put("/update-profile", protect, updateProfile)
router.get("/", protect, adminOnly, getAllUsers)
router.delete("/:id", protect, adminOnly, deleteUser)
router.get("/rentals", protect, getUserRentals)
router.get("/sales", protect, getUserSales)

module.exports = router
