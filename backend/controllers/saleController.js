const Sale = require("../models/Sale")
const Car = require("../models/Car")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    let query

    // If user is not admin or dealership manager, show only their sales
    if (req.user.role !== "admin" && req.user.role !== "dealership_manager") {
      query = Sale.find({ user: req.user.id })
    } else {
      query = Sale.find()
    }

    const sales = await query
      .populate({
        path: "car",
        select: "make model year color images",
      })
      .populate({
        path: "user",
        select: "name email",
      })

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  try {
    const { carId, paymentMethod } = req.body

    // Check if car exists
    const car = await Car.findById(carId)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Check if car is available for sale
    if (!car.forSale || !car.available) {
      return res.status(400).json({
        success: false,
        message: "Car is not available for sale",
      })
    }

    // Create sale
    const sale = await Sale.create({
      user: req.user.id,
      car: carId,
      price: car.price,
      paymentMethod,
    })

    // Update car availability
    car.available = false
    car.forSale = false
    car.forRent = false
    await car.save()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Sale created",
      resourceType: "sale",
      resourceId: sale._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: sale,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
