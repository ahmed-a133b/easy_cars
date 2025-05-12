const express = require("express")
const {
  getDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  deleteDealership
} = require("../controllers/dealershipController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", getDealerships)
router.get("/:id", getDealershipById)
router.post("/", protect, authorize("admin"), createDealership)
router.put("/:id", protect, authorize("admin"), updateDealership)
router.delete("/:id", protect, authorize("admin"), deleteDealership)

module.exports = router
