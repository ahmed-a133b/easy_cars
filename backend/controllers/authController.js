const User = require("../models/User")
const ActivityLog = require("../models/ActivityLog")

// Helper function to send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  console.log('Generated JWT token:', token.substring(0, 20) + '...');

  try {
    // Ensure JWT_COOKIE_EXPIRE is parsed as an integer
    const days = parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10);
    console.log('JWT_COOKIE_EXPIRE value:', process.env.JWT_COOKIE_EXPIRE);
    console.log('Parsed days value:', days);
    
    // Create an explicit date for the expires option
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    // Set cookie options - use expires instead of maxAge
    const cookieOptions = {
      expires: expiryDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/' // Explicitly set path to root
    };
    
    console.log('Cookie options:', JSON.stringify(cookieOptions));

    // Set session data
    if (res.req.session) {
      res.req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      console.log('Session user data set');
    } else {
      console.log('Warning: session object not available');
    }

    // Log cookie info for debugging
    console.log('Setting cookie with expiry:', expiryDate);

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
      
    console.log('Response sent with cookie');
  } catch (error) {
    console.error('Error setting cookie:', error);
    
    // Fallback to just sending the response without a cookie
    res.status(statusCode).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
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
    // Use explicit date for expires rather than maxAge
    const expiryDate = new Date(Date.now() + 10 * 1000); // 10 seconds from now
    
    // Clear the cookie
    res.cookie('token', 'none', {
      expires: expiryDate,
      httpOnly: true
    });

    // Clear the session
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Logout error:', error);
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
