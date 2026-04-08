const express = require('express');
const router = express.Router();
const { getShowsByMovie, getShowById } = require('../controllers/showController');

// Both routes are fully public — no auth required
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);

module.exports = router;
