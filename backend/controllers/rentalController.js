const Rental = require("../models/Rental")
const Car = require("../models/Car")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Private
exports.getRentals = async (req, res) => {
  try {
    let query

    // If user is not admin, show only their rentals
    if (req.user.role !== "admin" && req.user.role !== "dealership_manager") {
      query = Rental.find({ user: req.user.id })
    } else {
      query = Rental.find()
    }

    const rentals = await query
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
      count: rentals.length,
      data: rentals,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single rental
// @route   GET /api/rentals/:id
// @access  Private
exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate({
        path: "car",
        select: "make model year color images rentalPrice",
      })
      .populate({
        path: "user",
        select: "name email phone",
      })

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      })
    }

    // Make sure user is rental owner or admin
    if (
      rental.user._id.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "dealership_manager"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this rental",
      })
    }

    res.status(200).json({
      success: true,
      data: rental,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new rental
// @route   POST /api/rentals
// @access  Private
exports.createRental = async (req, res) => {
  try {
    const { carId, startDate, endDate, paymentMethod } = req.body

    // Check if car exists
    const car = await Car.findById(carId)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Check if car is available for rent
    if (!car.forRent || !car.available) {
      return res.status(400).json({
        success: false,
        message: "Car is not available for rent",
      })
    }

    // Calculate total price
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      })
    }

    const totalPrice = days * car.rentalPrice.daily

    // Create rental
    const rental = await Rental.create({
      user: req.user.id,
      car: carId,
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
    })

    // Update car availability
    car.available = false
    await car.save()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Rental created",
      resourceType: "rental",
      resourceId: rental._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: rental,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Cancel rental
// @route   PUT /api/rentals/:id/cancel
// @access  Private
exports.cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      })
    }

    // Make sure user is rental owner or admin
    if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to cancel this rental",
      })
    }

    // Check if rental can be cancelled
    if (rental.status === "completed" || rental.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Rental cannot be cancelled because it is ${rental.status}`,
      })
    }

    // Update rental status
    rental.status = "cancelled"
    rental.paymentStatus = "refunded"
    await rental.save()

    // Update car availability
    const car = await Car.findById(rental.car)
    car.available = true
    await car.save()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Rental cancelled",
      resourceType: "rental",
      resourceId: rental._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: rental,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete rental
// @route   DELETE /api/rentals/:id
// @access  Private/Admin
exports.deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental record not found",
      })
    }

    // Only admin can delete a rental
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this rental record",
      })
    }

    // Get car information before deleting
    const car = await Car.findById(rental.car)

    // Delete the rental
    await Rental.deleteOne({ _id: req.params.id });

    // If the car still exists and the rental was active, update its availability
    if (car && rental.status === 'active') {
      car.available = true
      await car.save()
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Rental deleted",
      resourceType: "rental",
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
