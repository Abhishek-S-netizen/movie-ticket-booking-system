const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({});
    res.json({ success: true, data: theatres });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res) => {
  try {
    const theatre = new Theatre(req.body);
    const createdTheatre = await theatre.save();
    res.status(201).json({ success: true, data: createdTheatre });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid theatre data', error: error.message });
  }
};

// @desc    Update a theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (theatre) {
      Object.assign(theatre, req.body);
      const updatedTheatre = await theatre.save();
      res.json({ success: true, data: updatedTheatre });
    } else {
      res.status(404).json({ success: false, message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid theatre data', error: error.message });
  }
};

// @desc    Delete a theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (theatre) {
      await theatre.deleteOne();
      res.json({ success: true, message: 'Theatre removed' });
    } else {
      res.status(404).json({ success: false, message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get movies playing at a specific theatre
// @route   GET /api/theatres/:id/movies
// @access  Public
const getMoviesByTheatre = async (req, res) => {
  try {
    // Find all unique movieIds from shows at this theatre
    const shows = await Show.find({ theatreId: req.params.id }).populate('movieId');

    // Extract unique movies
    const moviesMap = new Map();
    shows.forEach(show => {
      if (show.movieId && !moviesMap.has(show.movieId._id.toString())) {
        moviesMap.set(show.movieId._id.toString(), show.movieId);
      }
    });

    res.json({ success: true, data: Array.from(moviesMap.values()) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getMoviesByTheatre
};
