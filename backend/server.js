const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")

// Routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const carRoutes = require("./routes/carRoutes")
const rentalRoutes = require("./routes/rentalRoutes")
const saleRoutes = require("./routes/saleRoutes")
const forumRoutes = require("./routes/forumRoutes")
const logRoutes = require("./routes/logRoutes")
const dealershipRoutes = require("./routes/dealershipRoutes")



// Middleware
const { rateLimiter } = require("./middleware/rateLimiter")

// Config
dotenv.config()
require("./config/db")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.set('trust proxy', 1);

app.use(cors({
  origin: 'https://easy-cars.vercel.app',
  credentials: true
}));

app.options('*', cors({
  origin: 'https://easy-cars.vercel.app',
  credentials: true
}));

app.use(express.json())

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

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
