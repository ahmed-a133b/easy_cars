const mongoose = require("mongoose")

const DealershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide dealership name"],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "Please provide street address"],
      },
      city: {
        type: String,
        required: [true, "Please provide city"],
      },
      state: {
        type: String,
        required: [true, "Please provide state"],
      },
      zipCode: {
        type: String,
        required: [true, "Please provide zip code"],
      },
      country: {
        type: String,
        required: [true, "Please provide country"],
      },
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    description: String,
    images: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
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

module.exports = mongoose.model("Dealership", DealershipSchema)
