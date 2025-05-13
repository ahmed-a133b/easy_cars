const express = require('express');
const { uploadImages } = require('../controllers/uploadController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Protect all upload routes - require authentication
router.use(protect);

// Route for uploading images to Cloudinary
router.post('/', uploadImages);

module.exports = router; 