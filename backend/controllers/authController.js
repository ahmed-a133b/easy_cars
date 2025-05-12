const User = require("../models/User")
const ActivityLog = require("../models/ActivityLog")

// Helper function to send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Set cookie options
  const cookieOptions = {
    // Instead of using expires, use maxAge which is more reliable
    maxAge: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Convert days to milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Set session data
  if (res.req.session) {
    res.req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  // Send response with cookie
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
      phone,
      address,
    })

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "User registered",
      resourceType: "user",
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    // Send token response with cookie
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "User logged in",
      resourceType: "user",
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    // Send token response with cookie
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Clear the cookie - use maxAge instead of expires
    res.cookie('token', 'none', {
      maxAge: 10 * 1000, // Expires in 10 seconds
      httpOnly: true
    });

    // Clear the session
    if (req.session) {
      req.session.destroy();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
