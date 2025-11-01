const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, getCompanyByName, getTrustedCompanies } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCompanies);
router.get('/trusted', getTrustedCompanies);
router.get('/by-name/:name', getCompanyByName);
router.get('/:id', getCompanyById);

// Protected routes (for employers)
// router.post('/', protect, createCompany);

module.exports = router;