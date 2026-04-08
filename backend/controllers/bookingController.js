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
    const lockedSeatDocs = await SeatLock.find({ showId });
    const lockedSeats = lockedSeatDocs.map(lock => lock.seatNumber);

    res.status(200).json({
      success: true,
      data: {
        bookedSeats,
        lockedSeats
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
      message: 'Seats locked successfully for 5 minutes'
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

    // 3. Remove the seat locks since they are now fully booked
    await SeatLock.deleteMany({ showId, userId, seatNumber: { $in: seats } });

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

module.exports = {
  getSeatStatus,
  lockSeats,
  createBooking,
  getMyBookings
};
