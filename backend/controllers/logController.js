const ActivityLog = require("../models/ActivityLog")

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private/Admin
exports.getLogs = async (req, res) => {
  try {
    const { user, resourceType, startDate, endDate } = req.query

    // Build query
    const query = {}

    if (user) query.user = user
    if (resourceType) query.resourceType = resourceType

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.timestamp = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.timestamp = { $lte: new Date(endDate) }
    }

    const logs = await ActivityLog.find(query)
      .populate({
        path: "user",
        select: "name email role",
      })
      .sort({ timestamp: -1 })

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
