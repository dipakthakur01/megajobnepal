const express = require('express');
const router = express.Router();
const {
  getParameters,
  createParameter,
  updateParameter,
  deleteParameter,
} = require('../controllers/companyParameterController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public: list parameters by type
router.get('/:type', getParameters);

// Admin-only: create/update/delete
router.post('/:type', authenticateToken, requireRole('admin'), createParameter);
router.put('/:type/:id', authenticateToken, requireRole('admin'), updateParameter);
router.delete('/:type/:id', authenticateToken, requireRole('admin'), deleteParameter);

module.exports = router;