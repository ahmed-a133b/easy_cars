const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('user', 'email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
