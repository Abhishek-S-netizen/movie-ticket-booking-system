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
  getAnalytics
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication AND admin role
router.use(protect, admin);

// ── Show Management ──────────────────────────
router.route('/shows')
  .get(getAllShows)
  .post(createShow);

router.get('/shows/movie/:movieId', getShowsByMovie);

router.route('/shows/:id')
  .put(updateShow)
  .delete(deleteShow);

// ── User Management ──────────────────────────
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// ── Analytics ────────────────────────────────
router.get('/analytics', getAnalytics);

module.exports = router;
