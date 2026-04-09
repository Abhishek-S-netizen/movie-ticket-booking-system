const express = require('express');
const router = express.Router();
const {
  getSeatStatus,
  lockSeats,
  createBooking,
  getMyBookings,
  cancelBooking,
  unlockSeats
} = require('../controllers/bookingController');
const { protect, admin, optProtect } = require('../middleware/authMiddleware');

// Publicly accessible, but identity-aware (checks for user token if present)
router.get('/shows/:showId/seats', optProtect, getSeatStatus);

// Protected routes
router.post('/shows/:showId/lock', protect, lockSeats);
router.delete('/shows/:showId/lock', protect, unlockSeats);
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
