const express = require('express');
const router = express.Router();
const {
  getSeatStatus,
  lockSeats,
  createBooking,
  getMyBookings
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public route to see which seats are taken/locked
router.get('/shows/:showId/seats', getSeatStatus);

// Protected routes
router.post('/shows/:showId/lock', protect, lockSeats);
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
