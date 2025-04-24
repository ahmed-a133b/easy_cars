const Dealership = require("../models/Dealership")
const Car = require("../models/Car")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get all dealerships
// @route   GET /api/dealerships
// @access  Public
exports.getDealerships = async (req, res) => {
  try {
    const dealerships = await Dealership.find()

    res.status(200).json({
      success: true,
      count: dealerships.length,
      data: dealerships,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single dealership
// @route   GET /api/dealerships/:id
// @access  Public
exports.getDealershipById = async (req, res) => {
  try {
    const dealership = await Dealership.findById(req.params.id)

    if (!dealership) {
      return res.status(404).json({
        success: false,
        message: "Dealership not found",
      })
    }

    // Get cars from this dealership
    const cars = await Car.find({ dealership: req.params.id, available: true })

    res.status(200).json({
      success: true,
      data: {
        dealership,
        cars,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new dealership
// @route   POST /api/dealerships
// @access  Private/Admin
exports.createDealership = async (req, res) => {
  try {
    const dealership = await Dealership.create(req.body)

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Dealership created",
      resourceType: "dealership",
      resourceId: dealership._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: dealership,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update dealership
// @route   PUT /api/dealerships/:id
// @access  Private/Admin
exports.updateDealership = async (req, res) => {
  try {
    const dealership = await Dealership.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!dealership) {
      return res.status(404).json({
        success: false,
        message: "Dealership not found",
      })
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Dealership updated",
      resourceType: "dealership",
      resourceId: dealership._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: dealership,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
