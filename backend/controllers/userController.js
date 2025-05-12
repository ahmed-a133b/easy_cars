const User = require("../models/User")
const Rental = require("../models/Rental")
const Sale = require("../models/Sale")
const ActivityLog = require("../models/ActivityLog")

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update fields
    if (name) user.name = name
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "User profile updated",
      resourceType: "user",
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await User.deleteOne({ _id: req.params.id });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "User deleted",
      resourceType: "user",
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

// @desc    Get user rental history
// @route   GET /api/users/rentals
// @access  Private
exports.getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user.id }).populate("car").sort({ createdAt: -1 })

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

// @desc    Get user sale history
// @route   GET /api/users/sales
// @access  Private
exports.getUserSales = async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user.id }).populate("car").sort({ createdAt: -1 })

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
