const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getJobs,
  getMyJobs,
  getJobById,
  createJob
} = require('../controllers/jobController');

// Import seed function from admin controller
const { seedDatabase } = require('../controllers/adminController');

// Public routes
router.get('/', getJobs);

// Public seed route for development
router.post('/seed', seedDatabase);

// Protected routes (must come before /:id to avoid conflicts)
router.get('/my-jobs', authenticateToken, getMyJobs);

// Public routes with parameters (must come after specific routes)
router.get('/:id', getJobById);
router.post('/', authenticateToken, createJob);

module.exports = router;