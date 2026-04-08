const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  screenNumber: { type: Number, required: true },
  showTime: { type: Date, required: true },
  pricing: { 
    standard: { type: Number, required: true },
    premium: { type: Number, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Show', showSchema);
