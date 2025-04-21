const Sale = require('../models/Sale');

exports.createSale = async (req, res) => {
  try {
    const sale = await Sale.create({ ...req.body, seller: req.user._id });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSalesByUser = async (req, res) => {
  try {
    const sales = await Sale.find({ $or: [{ seller: req.user._id }, { buyer: req.user._id }] }).populate('car buyer');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
