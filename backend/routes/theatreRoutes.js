const express = require('express');
const router = express.Router();
const {
  getTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require('../controllers/theatreController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTheatres)
  .post(protect, admin, createTheatre);

router.route('/:id')
  .put(protect, admin, updateTheatre)
  .delete(protect, admin, deleteTheatre);

module.exports = router;
