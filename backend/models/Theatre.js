const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: { type: Number, required: true },
  seatingCapacity: { type: Number, required: true },
  seatLayout: { type: Object, required: true } // e.g. { rows: 10, cols: 15, premiumRows: [8,9] }
});

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  screens: [screenSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theatre', theatreSchema);
