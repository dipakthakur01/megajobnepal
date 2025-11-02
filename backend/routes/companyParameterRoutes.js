const express = require('express');
const router = express.Router();
const {
  getParameters,
  createParameter,
  updateParameter,
  deleteParameter,
} = require('../controllers/companyParameterController');
const { authenticateToken, requireAnyRole } = require('../middleware/authMiddleware');

// Public: list parameters by type
router.get('/:type', getParameters);

// Admin-only: create/update/delete
// Allow both 'admin' and 'super_admin' to manage parameters
router.post('/:type', authenticateToken, requireAnyRole(['admin', 'super_admin']), createParameter);
router.put('/:type/:id', authenticateToken, requireAnyRole(['admin', 'super_admin']), updateParameter);
router.delete('/:type/:id', authenticateToken, requireAnyRole(['admin', 'super_admin']), deleteParameter);

module.exports = router;