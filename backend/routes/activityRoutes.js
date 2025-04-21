const express = require('express');
const router = express.Router();
const activityCtrl = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, activityCtrl.getLogs);

module.exports = router;
