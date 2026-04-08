const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────
// SHOW MANAGEMENT
// ─────────────────────────────────────────────

// @desc    Get all shows (with movie and theatre details)
// @route   GET /api/admin/shows
// @access  Private/Admin
const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({})
      .populate('movieId', 'title posterUrl duration')
      .populate('theatreId', 'name location city')
      .sort('showTime');

    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching shows', error: error.message });
  }
};

// @desc    Get shows for a specific movie
// @route   GET /api/admin/shows/movie/:movieId
// @access  Private/Admin
const getShowsByMovie = async (req, res) => {
  try {
    const shows = await Show.find({ movieId: req.params.movieId })
      .populate('theatreId', 'name location city')
      .sort('showTime');

    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a new show
// @route   POST /api/admin/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, screenNumber, showTime, pricing } = req.body;

    if (!movieId || !theatreId || !screenNumber || !showTime || !pricing) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify movie and theatre exist
    const movie = await Movie.findById(movieId);
    const theatre = await Theatre.findById(theatreId);

    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });

    // Check the screenNumber actually belongs to this theatre
    const screenExists = theatre.screens.some(s => s.screenNumber === screenNumber);
    if (!screenExists) {
      return res.status(400).json({ success: false, message: `Screen ${screenNumber} does not exist in this theatre` });
    }

    const show = await Show.create({ movieId, theatreId, screenNumber, showTime, pricing });

    res.status(201).json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating show', error: error.message });
  }
};

// @desc    Update a show
// @route   PUT /api/admin/shows/:id
// @access  Private/Admin
const updateShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    Object.assign(show, req.body);
    const updatedShow = await show.save();

    res.status(200).json({ success: true, data: updatedShow });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating show', error: error.message });
  }
};

// @desc    Delete a show
// @route   DELETE /api/admin/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    await show.deleteOne();

    res.status(200).json({ success: true, message: 'Show removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting show', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Promote a user to admin or demote an admin to user
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be either 'user' or 'admin'" });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating role', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ANALYTICS & REPORTING
// ─────────────────────────────────────────────

// @desc    Get dashboard analytics summary
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueData
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Confirmed' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Booking.aggregate([
        { $match: { bookingStatus: 'Confirmed', paymentStatus: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Top 5 movies by number of confirmed bookings
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'Confirmed' } },
      { $lookup: { from: 'shows', localField: 'showId', foreignField: '_id', as: 'show' } },
      { $unwind: '$show' },
      { $group: { _id: '$show.movieId', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $project: { _id: 0, title: '$movie.title', posterUrl: '$movie.posterUrl', bookingCount: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        topMovies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching analytics', error: error.message });
  }
};

module.exports = {
  getAllShows,
  getShowsByMovie,
  createShow,
  updateShow,
  deleteShow,
  getAllUsers,
  updateUserRole,
  getAnalytics
};
