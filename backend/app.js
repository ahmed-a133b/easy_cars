// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Easy Cars API is running...');
});

// Error handler
app.use(errorHandler);

module.exports = app;