const express = require('express');
const router = express.Router();
const rentalCtrl = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');

router.post('/', protect, rentalCtrl.createRental);
router.get('/my-rentals', protect, rentalCtrl.getRentalsByUser);

module.exports = router;
