const Car = require("../models/Car")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    const { make, model, year, minPrice, maxPrice, forRent, forSale } = req.query

    // Build query
    const query = {}

    if (make) query.make = { $regex: make, $options: "i" }
    if (model) query.model = { $regex: model, $options: "i" }
    if (year) query.year = year
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice }
    } else if (minPrice) {
      query.price = { $gte: minPrice }
    } else if (maxPrice) {
      query.price = { $lte: maxPrice }
    }

    if (forRent === "true") query.forRent = true
    if (forSale === "true") query.forSale = true

    const cars = await Car.find(query).populate("dealership")

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("dealership")

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    res.status(200).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new car
// @route   POST /api/cars
// @access  Private/Dealership Manager
exports.createCar = async (req, res) => {
  try {
    // Add user to req.body
    req.body.dealership = req.body.dealership || req.user.dealership

    const car = await Car.create(req.body)

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car created",
      resourceType: "car",
      resourceId: car._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Dealership Manager
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Make sure user is car owner or admin
    if (car.dealership.toString() !== req.user.dealership && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this car",
      })
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car updated",
      resourceType: "car",
      resourceId: car._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Dealership Manager
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Make sure user is car owner or admin
    if (car.dealership.toString() !== req.user.dealership && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this car",
      })
    }

    await car.remove()

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car deleted",
      resourceType: "car",
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

exports.getFeaturedCars = async (req, res) => { 
  try {
    const cars = await Car.find({ available: true, forSale: true }).limit(3);
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch featured cars" });
  }
}


