const express = require('express');
const router = express.Router();
const saleCtrl = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saleCtrl.createSale);
router.get('/my-sales', protect, saleCtrl.getSalesByUser);

module.exports = router;
