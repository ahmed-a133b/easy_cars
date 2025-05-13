const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'easy-cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 800, crop: 'limit' }]
  }
});

// Create multer upload middleware with Cloudinary storage
const uploadToCloudinary = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).array('images', 10); // Up to 10 images

// Upload to Cloudinary
exports.uploadImages = (req, res) => {
  uploadToCloudinary(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Files have been uploaded to Cloudinary
    // Get the URLs of the uploaded images
    const imageUrls = req.files.map(file => file.path);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      urls: imageUrls
    });
  });
}; 