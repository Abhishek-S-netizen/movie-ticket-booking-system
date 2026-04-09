const express = require('express');
const router = express.Router();
const {
  getTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getMoviesByTheatre
} = require('../controllers/theatreController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTheatres)
  .post(protect, admin, createTheatre);

router.get('/:id/movies', getMoviesByTheatre);

router.route('/:id')
  .put(protect, admin, updateTheatre)
  .delete(protect, admin, deleteTheatre);

module.exports = router;
