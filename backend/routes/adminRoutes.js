const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowsByMovie,
  createShow,
  updateShow,
  deleteShow,
  getAllUsers,
  updateUserRole,
  getAnalytics,
  getAllMovies,
  getUserBookings,
  getMovieStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication AND admin role
router.use(protect, admin);

// ── User History ──────────────────────────────
router.get('/user-history/:id', getUserBookings);

// ── Show Management ──────────────────────────
router.route('/shows')
  .get(getAllShows)
  .post(createShow);



router.route('/shows/:id')
  .put(updateShow)
  .delete(deleteShow);

// ── User Management ──────────────────────────
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
// ── Analytics ────────────────────────────────
router.get('/analytics', getAnalytics);
router.get('/movies', getAllMovies);
router.get('/movies/:id/stats', getMovieStats);

module.exports = router;
