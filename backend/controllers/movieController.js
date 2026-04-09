const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { status, isArchived } = req.query;
    let query = {};

    // 1. Admin Override (Checks secure token instead of URL parameter)
    if (req.user && req.user.role === 'admin') {
      const movies = await Movie.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, data: movies });
    }

    // 2. Filter by archive status (Public logic)
    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    } else {
      query.isArchived = { $ne: true };
    }

    // 2. Filter by release status
    const today = new Date();
    if (status === 'released') {
      query.releaseDate = { $lte: today };
    } else if (status === 'upcoming') {
      query.releaseDate = { $gt: today };
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      res.json({ success: true, data: movie });
    } else {
      res.status(404).json({ success: false, message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const createdMovie = await movie.save();
    res.status(201).json({ success: true, data: createdMovie });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid movie data', error: error.message });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      // Logic for Archiving Validation
      if (req.body.isArchived === true && movie.isArchived !== true) {
        const activeShowsCount = await Show.countDocuments({
          movieId: req.params.id,
          showTime: { $gte: new Date() }
        });

        if (activeShowsCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot archive movie. There are ${activeShowsCount} upcoming shows scheduled. Please delete or wait for these shows to complete first.`
          });
        }
      }

      Object.assign(movie, req.body);
      const updatedMovie = await movie.save();
      res.json({ success: true, data: updatedMovie });
    } else {
      res.status(404).json({ success: false, message: 'Movie not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid movie data', error: error.message });
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      await movie.deleteOne();
      res.json({ success: true, message: 'Movie removed' });
    } else {
      res.status(404).json({ success: false, message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
