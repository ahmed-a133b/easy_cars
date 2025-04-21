const express = require('express');
const router = express.Router();
const carCtrl = require('../controllers/carController');
const { protect } = require('../middleware/auth');

router.get('/', carCtrl.getAllCars);
router.get('/:id', carCtrl.getCarById);
router.post('/', protect, carCtrl.createCar);
router.put('/:id', protect, carCtrl.updateCar);
router.delete('/:id', protect, carCtrl.deleteCar);

module.exports = router;
