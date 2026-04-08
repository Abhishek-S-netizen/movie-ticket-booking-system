const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seatNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // This lock will automatically expire 5 minutes after creation
  expiresAt: { type: Date, default: () => Date.now() + 5*60*1000, expires: 0 }
});

// Compound index to ensure a specific seat in a specific show can't be locked by multiple users
seatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', seatLockSchema);
