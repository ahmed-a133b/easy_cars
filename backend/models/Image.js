const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    contentType: {
      type: String,
      required: true
    },
    // Store the actual binary image data
    data: {
      type: Buffer,
      required: true
    },
    // Reference to the car this image belongs to
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Image', ImageSchema); 