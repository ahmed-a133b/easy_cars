const jwt = require("jsonwebtoken")
const User = require("../models/User")

exports.protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // Get token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Check if session exists and has user data (as a backup)
  else if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request
    req.user = await User.findById(decoded.id);

    // If session exists, update session data
    if (req.session) {
      req.session.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
