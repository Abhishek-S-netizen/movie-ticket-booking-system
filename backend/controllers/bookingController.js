const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Show = require('../models/Show');

// @desc    Get seat status for a specific show (booked and locked seats)
// @route   GET /api/bookings/shows/:showId/seats
// @access  Public
const getSeatStatus = async (req, res) => {
  try {
    const { showId } = req.params;

    // 1. Get all confirmed bookings for this show to find booked seats
    const bookings = await Booking.find({ showId, bookingStatus: 'Confirmed' });
    let bookedSeats = [];
    bookings.forEach(booking => {
      bookedSeats.push(...booking.seats);
    });

    // 2. Get all currently locked seats for this show
    const currentUserId = req.user ? req.user._id.toString() : null;
    const lockedSeatDocs = await SeatLock.find({ showId });

    // Separate locks into the user's own locks vs others
    const lockedSeats = [];
    const myLockedSeats = [];
    let myLockExpiry = null;

    lockedSeatDocs.forEach(lock => {
      if (currentUserId && lock.userId.toString() === currentUserId) {
        myLockedSeats.push(lock.seatNumber);
        // Track the expiry time for the user's session
        if (!myLockExpiry || lock.expiresAt < myLockExpiry) {
          myLockExpiry = lock.expiresAt;
        }
      } else {
        lockedSeats.push(lock.seatNumber);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        bookedSeats,
        lockedSeats,
        myLockedSeats,
        myLockExpiry
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching seat status' });
  }
};

// @desc    Lock seats temporarily for a user
// @route   POST /api/bookings/shows/:showId/lock
// @access  Private
const lockSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body;
    const userId = req.user._id;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide seats to lock' });
    }

    // Pre-emptive Cleanup (Approach B): Remove any existing locks for this user and show
    // before creating new ones. This prevents "locking leaks" if the user changes their mind.
    await SeatLock.deleteMany({ showId, userId });

    // 1. Check if any of the requested seats are already permanently booked
    const conflictingBookings = await Booking.find({
      showId,
      bookingStatus: 'Confirmed',
      seats: { $in: seats }
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'One or more selected seats are already booked.' });
    }

    // 2. Try to lock the seats
    const lockPromises = seats.map(seatNumber => {
      return SeatLock.create({
        showId,
        seatNumber,
        userId
      });
    });

    try {
      await Promise.all(lockPromises);
    } catch (err) {
      // If error (like duplicate key index violation), it means a seat is already locked
      return res.status(409).json({ success: false, message: 'Some seats are currently locked by another user. Please try again later.' });
    }

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully for 5 minutes',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error locking seats' });
  }
};

// @desc    Create a final booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showId, seats, totalAmount, paymentStatus } = req.body;
    const userId = req.user._id;

    if (!showId || !seats || seats.length === 0 || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Verify that the user currently holds the locks for these seats
    const userLocks = await SeatLock.find({ showId, userId, seatNumber: { $in: seats } });
    if (userLocks.length !== seats.length) {
      return res.status(400).json({ success: false, message: 'Seat locks expired or invalid. Please select seats again.' });
    }

    // 2. Create the Booking
    const booking = await Booking.create({
      userId,
      showId,
      seats,
      totalAmount,
      paymentStatus: paymentStatus || 'Completed', // Mocking payment success
      bookingStatus: 'Confirmed'
    });

    // 3. Remove ALL seat locks for this show and user since the booking is now confirmed
    // (Clears the currently selected seats AND any ghost locks that might have been left over)
    await SeatLock.deleteMany({ showId, userId });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl releaseDate' },
          { path: 'theatreId', select: 'name location city' }
        ]
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching your bookings' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership (or admin status)
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Check time limit (e.g., 2 hours before showtime)
    const showTime = new Date(booking.showId.showTime);
    const now = new Date();
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation not allowed. Tickets can only be cancelled up to 2 hours before showtime.'
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

// @desc    Unlock seats manually (Discard Selection)
// @route   DELETE /api/bookings/shows/:showId/lock
// @access  Private
const unlockSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const userId = req.user._id;

    // Remove all seat locks for this specific show and user
    // Isolation: This only affects the authenticated user's locks
    await SeatLock.deleteMany({ showId, userId });

    res.status(200).json({
      success: true,
      message: 'Seats released successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error releasing seats' });
  }
};

module.exports = {
  getSeatStatus,
  lockSeats,
  createBooking,
  getMyBookings,
  cancelBooking,
  unlockSeats
};
