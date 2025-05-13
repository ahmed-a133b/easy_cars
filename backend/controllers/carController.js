const Car = require("../models/Car")
const ActivityLog = require("../models/ActivityLog")
const Image = require("../models/Image")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    const { make, model, year, minPrice, maxPrice, forRent, forSale } = req.query

    // Build query
    const query = {}

    if (make) query.make = { $regex: make, $options: "i" }
    if (model) query.model = { $regex: model, $options: "i" }
    if (year) query.year = year
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice }
    } else if (minPrice) {
      query.price = { $gte: minPrice }
    } else if (maxPrice) {
      query.price = { $lte: maxPrice }
    }

    if (forRent === "true") query.forRent = true
    if (forSale === "true") query.forSale = true

    const cars = await Car.find(query).populate("dealership")

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("dealership")

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    res.status(200).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new car
// @route   POST /api/cars
// @access  Private
exports.createCar = async (req, res) => {
  try {
    // Add user's ID as owner
    req.body.owner = req.user.id
    
    // Remove dealership if it exists
    if (req.body.dealership) {
      delete req.body.dealership
    }

    const car = await Car.create(req.body)

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car created",
      resourceType: "car",
      resourceId: car._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(201).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Make sure user is car owner or admin
    if (car.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this car",
      })
    }

    // Ensure owner field is preserved and dealership is removed
    req.body.owner = car.owner
    if (req.body.dealership) {
      delete req.body.dealership
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car updated",
      resourceType: "car",
      resourceId: car._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: car,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      })
    }

    // Make sure user is car owner or admin
    if (car.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this car",
      })
    }

    // Delete any binary images associated with this car
    await Image.deleteMany({ car: req.params.id });

    await Car.deleteOne({ _id: req.params.id });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: "Car deleted",
      resourceType: "car",
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getFeaturedCars = async (req, res) => { 
  try {
    const cars = await Car.find({ available: true, forSale: true }).limit(3);
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch featured cars" });
  }
}

// @desc    Add binary image to car
// @route   POST /api/cars/:id/images
// @access  Private
exports.addBinaryImageToCar = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const car = await Car.findById(req.params.id).session(session);

    if (!car) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Check authorization
    if (car.owner.toString() !== req.user.id && req.user.role !== "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this car",
      });
    }

    // Process each uploaded file
    const uploadedImages = [];
    const imageUrls = [];

    // Handle case where files were uploaded via the binary upload endpoint
    if (req.body.files && Array.isArray(req.body.files)) {
      for (const fileInfo of req.body.files) {
        try {
          // Read the file from disk
          const filePath = fileInfo.path;
          const contentType = path.extname(filePath).substring(1);
          const data = fs.readFileSync(filePath);

          // Create a new Image document with binary data
          const image = await Image.create([{
            filename: fileInfo.filename,
            contentType: `image/${contentType}`,
            data: data,
            car: car._id
          }], { session });

          uploadedImages.push(image[0]);
          
          // Create a URL for retrieving the image
          const imageUrl = `/api/cars/images/${image[0]._id}`;
          imageUrls.push(imageUrl);
          
          // Delete the temporary file
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error processing image ${fileInfo.filename}:`, err);
        }
      }
    }

    // Update the car with the new image URLs
    if (imageUrls.length > 0) {
      car.images = [...(car.images || []), ...imageUrls];
      await car.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images added to car`,
      data: {
        car,
        imageUrls
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get binary image
// @route   GET /api/cars/images/:imageId
// @access  Public
exports.getBinaryImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }
    
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's car listings
// @route   GET /api/cars/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    // Find cars where the user is the owner
    const cars = await Car.find({ owner: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


