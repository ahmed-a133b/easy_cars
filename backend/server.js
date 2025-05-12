const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")
const session = require('express-session')
const cookieParser = require('cookie-parser')

// Routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const carRoutes = require("./routes/carRoutes")
const rentalRoutes = require("./routes/rentalRoutes")
const saleRoutes = require("./routes/saleRoutes")
const forumRoutes = require("./routes/forumRoutes")
const logRoutes = require("./routes/logRoutes")
const dealershipRoutes = require("./routes/dealershipRoutes")

// Config
dotenv.config()
require("./config/db")

// Middleware
const { rateLimiter } = require("./middleware/rateLimiter")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.set('trust proxy', 1);

const corsOptions = {
  origin: 'https://easy-cars.vercel.app', // Replace with your frontend URL
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  }
};

// Only create a MongoDB store if MONGO_URI is available
if (process.env.MONGO_URI) {
  try {
    // Create MongoDB Atlas session store using mongoose connection
    const MongoDBStore = require('connect-mongodb-session')(session);
    
    // Calculate expiration in seconds for MongoDB store
    const twoWeeksInSeconds = 14 * 24 * 60 * 60; // 14 days
    
    const store = new MongoDBStore({
      uri: process.env.MONGO_URI,
      collection: 'sessions',
      expires: twoWeeksInSeconds,
      connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    });

    // Handle store errors
    store.on('error', function(error) {
      console.log('Session store error:', error);
    });

    sessionOptions.store = store;
    
    console.log('MongoDB session store configured');
  } catch (error) {
    console.error('Error setting up session store:', error);
    // Continue without a persistent store - will use memory store
  }
}

// Log session options for debugging
console.log('Session cookie expires:', sessionOptions.cookie.expires);

app.use(session(sessionOptions));

app.use(rateLimiter)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/cars", carRoutes)
app.use("/api/rentals", rentalRoutes)
app.use("/api/sales", saleRoutes)
app.use("/api/forum", forumRoutes)
app.use("/api/logs", logRoutes)
app.use("/api/dealerships", dealershipRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))

  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
