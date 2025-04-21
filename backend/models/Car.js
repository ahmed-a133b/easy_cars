// backend/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Car year is required']
  },
  color: {
    type: String,
    required: [true, 'Car color is required']
  },
  mileage: {
    type: Number,
    required: [true, 'Car mileage is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  features: [{
    type: String
  }],
  forSale: {
    type: Boolean,
    default: false
  },
  forRent: {
    type: Boolean,
    default: false
  },
  rentPrice: {
    daily: {
      type: Number
    },
    weekly: {
      type: Number
    },
    monthly: {
      type: Number
    }
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    },
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'under_review', 'maintenance'],
    default: 'under_review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexing for location-based queries
carSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Car', carSchema);