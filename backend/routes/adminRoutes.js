const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminAuth');

router.post('/register', adminCtrl.registerAdmin);
router.post('/login', adminCtrl.loginAdmin);
router.get('/profile', protectAdmin, adminCtrl.getAdminProfile);

module.exports = router;
