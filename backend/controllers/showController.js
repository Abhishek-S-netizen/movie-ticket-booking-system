const Show = require('../models/Show');

// @desc    Get all upcoming shows for a specific movie
// @route   GET /api/shows/movie/:movieId
// @access  Public
const getShowsByMovie = async (req, res) => {
  try {
    const now = new Date();

    const shows = await Show.find({
      movieId: req.params.movieId,
      showTime: { $gte: now } // Only return upcoming shows
    })
      .populate('theatreId', 'name location city screens')
      .sort('showTime');

    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching shows', error: error.message });
  }
};

// @desc    Get a single show's full details (for seat selection page)
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId', 'title posterUrl duration language ageRating description')
      .populate('theatreId', 'name location city screens');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.status(200).json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching show details', error: error.message });
  }
};

module.exports = {
  getShowsByMovie,
  getShowById
};
