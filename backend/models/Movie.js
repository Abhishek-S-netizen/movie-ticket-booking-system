const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: [{ type: String }],
  duration: { type: Number, required: true }, // in minutes
  language: { type: String, required: true },
  ageRating: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  posterUrl: { type: String },
  backdropUrl: { type: String },
  trailerUrl: { type: String },
  rating: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
