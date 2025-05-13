const mongoose = require("mongoose")

const CarSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, "Please provide car make"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Please provide car model"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Please provide car year"],
    },
    color: {
      type: String,
      required: [true, "Please provide car color"],
    },
    price: {
      type: Number,
      required: [true, "Please provide car price"],
    },
    mileage: {
      type: Number,
      required: [true, "Please provide car mileage"],
    },
    fuelType: {
      type: String,
      enum: ["Gasoline", "Diesel", "Electric", "Hybrid"],
      required: [true, "Please provide fuel type"],
    },
    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      required: [true, "Please provide transmission type"],
    },
    description: {
      type: String,
      required: [true, "Please provide car description"],
    },
    images: [String],
    features: [String],
    available: {
      type: Boolean,
      default: true,
    },
    forRent: {
      type: Boolean,
      default: false,
    },
    forSale: {
      type: Boolean,
      default: true,
    },
    rentalPrice: {
      daily: Number,
      weekly: Number,
      monthly: Number,
    },
    dealership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Car", CarSchema)
