// backend/models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  rentalStatus: {
    type: String,
    enum: ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  pickupLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  returnLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);