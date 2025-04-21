const Rental = require('../models/Rental');

exports.createRental = async (req, res) => {
  try {
    const rental = await Rental.create({ ...req.body, customer: req.user._id });
    res.status(201).json(rental);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRentalsByUser = async (req, res) => {
  try {
    const rentals = await Rental.find({ customer: req.user._id }).populate('car');
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
