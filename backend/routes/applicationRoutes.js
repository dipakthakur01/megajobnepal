const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createApplication,
  getApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

// All application routes require authentication
router.use(authenticateToken);

// POST /api/applications - Create new application
router.post('/', createApplication);

// GET /api/applications - Get user's applications
router.get('/', getApplications);

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', updateApplicationStatus);

module.exports = router;