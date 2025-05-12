const express = require("express")
const { register, login, getProfile, logout } = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware")

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/logout", protect, logout)
router.get("/profile", protect, getProfile)

module.exports = router
