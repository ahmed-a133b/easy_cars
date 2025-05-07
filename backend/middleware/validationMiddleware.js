// Validation middleware for all routes
const { body, validationResult } = require('express-validator');

// Utility function to validate request and return errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error',
      errors: errors.array() 
    });
  }
  next();
};

// Auth validation
exports.validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email is invalid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Phone number is invalid'),
  
  validateRequest
];

exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email is invalid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validateRequest
];

// Car validation
exports.validateCarInput = [
  body('make')
    .notEmpty().withMessage('Make is required')
    .isLength({ min: 1, max: 50 }).withMessage('Make must be between 1 and 50 characters'),
  
  body('model')
    .notEmpty().withMessage('Model is required')
    .isLength({ min: 1, max: 50 }).withMessage('Model must be between 1 and 50 characters'),
  
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Year must be valid'),
  
  body('color')
    .notEmpty().withMessage('Color is required'),
  
  body('mileage')
    .notEmpty().withMessage('Mileage is required')
    .isNumeric().withMessage('Mileage must be a number')
    .isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  validateRequest
];

// Rental validation
exports.validateRental = [
  body('carId')
    .notEmpty().withMessage('Car ID is required'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  validateRequest
];

// Sale validation
exports.validateSale = [
  body('carId')
    .notEmpty().withMessage('Car ID is required'),
  
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal', 'financing', 'cash']).withMessage('Invalid payment method'),
  
  validateRequest
];

// Forum post validation
exports.validateForumPost = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  
  validateRequest
];

// Comment validation
exports.validateComment = [
  body('content')
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 2 }).withMessage('Comment must be at least 2 characters'),
  
  validateRequest
]; 