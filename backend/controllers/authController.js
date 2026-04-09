const User = require('../models/User');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Show = require('../models/Show');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role: 'user',
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Deny access if account was soft-deleted
    if (user && user.isDeleted) {
      return res.status(401).json({ message: 'Account has been deleted. Please contact support or register a new account.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { name, email, phoneNumber, currentPassword, newPassword } = req.body;
      let requiresRelogin = false;

      // Update basic fields if provided
      if (name) user.name = name;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      // Email update
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email address is already in use.' });
        }
        user.email = email;
        requiresRelogin = true;
      }

      // Password update
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to set a new password.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect current password.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        requiresRelogin = true;
      }

      const updatedUser = await user.save();

      if (requiresRelogin) {
        res.json({ requiresRelogin: true });
      } else {
        res.json({
          token: generateToken(updatedUser._id),
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
          }
        });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url (sending directly to frontend)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #0a0c10; margin: 0; padding: 0; color: #f0f4f8; }
          .container { max-width: 600px; margin: 40px auto; background-color: #111318; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 32px -5px rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); }
          .header { background: #0a0c10; padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(0, 229, 191, 0.1); }
          .header h1 { margin: 0; font-size: 28px; color: #00e5bf; letter-spacing: 4px; text-transform: uppercase; font-family: 'Bebas Neue', 'Arial Black', sans-serif; }
          .content { padding: 40px; text-align: center; line-height: 1.6; }
          .content h2 { color: #f0f4f8; margin-bottom: 20px; font-weight: 700; }
          .content p { color: #8fa3b8; font-size: 16px; margin-bottom: 30px; }
          .button-container { margin: 35px 0; }
          .button { background-color: #00e5bf; color: #0a0c10 !important; padding: 16px 36px; text-decoration: none; font-weight: 700; border-radius: 8px; transition: all 0.2s; display: inline-block; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 0 20px rgba(0, 229, 191, 0.2); }
          .footer { background-color: #0a0c10; padding: 25px; text-align: center; font-size: 12px; color: #55677a; border-top: 1px solid rgba(255, 255, 255, 0.03); }
          .link-fallback { margin-top: 25px; font-size: 11px; color: #55677a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cinemax</h1>
          </div>
          <div class="content">
            <h2>Access Recovery</h2>
            <p>A request was made to reset your account password. If you initiated this, please use the secure button below.</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>For your security, this request will expire in 10 minutes.</p>
            <div class="link-fallback">
              Secure automated message. Ref: ${crypto.randomBytes(4).toString('hex').toUpperCase()}
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cinemax. The Ultimate Movie Experience.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Your password - Cinemax',
        message,
        html: htmlMessage
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // 1. Find user (attach session)
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Find bookings (attach session)
    const userBookings = await Booking.find({
      userId,
      bookingStatus: 'Confirmed'
    })
      .populate('showId')
      .session(session);

    const now = new Date();

    // 3. Cancel future bookings
    for (let booking of userBookings) {
      if (booking.showId && new Date(booking.showId.showTime) >= now) {
        booking.bookingStatus = 'Cancelled';
        booking.paymentStatus = 'Refunded';
        await booking.save({ session });
      }
    }

    // 4. Delete seat locks (attach session)
    await SeatLock.deleteMany({ userId }).session(session);

    // 5. Scrub user (FIXED password hashing)
    user.name = "Deleted User";
    user.email = `deleted_${user._id}@cinemax.com`;
    user.phoneNumber = "";

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      salt
    );

    user.isDeleted = true;

    await user.save({ session });

    // ✅ Commit everything
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Account deleted. All future bookings have been cancelled.'
    });

  } catch (error) {
    // Rollback everything if error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: 'Server error during account deletion',
      error: error.message
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  deleteUserAccount,
};
