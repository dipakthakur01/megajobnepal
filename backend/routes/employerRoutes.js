const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadImage, uploadCompanyLogo: uploadCompanyLogoMiddleware, uploadCompanyBanner } = require('../utils/uploadHelper');
const {
  getAllEmployers,
  getEmployerById,
  createEmployer,
  updateEmployer,
  deleteEmployer,
  getCurrentEmployerProfile,
  updateCurrentEmployerProfile,
  updateCompanyLogoForEmployer,
  updateCompanyBannerForEmployer,
  getSubscriptionInfo,
  upgradeSubscription
} = require('../controllers/employerController');

// Employer self-service profile routes (place BEFORE parameterized routes to avoid shadowing)
router.get('/profile', authenticateToken, getCurrentEmployerProfile);
router.put('/profile', authenticateToken, updateCurrentEmployerProfile);
router.post('/upload-logo', authenticateToken, uploadImage.single('logo'), uploadCompanyLogoMiddleware, updateCompanyLogoForEmployer);
router.post('/upload-banner', authenticateToken, uploadImage.single('banner'), uploadCompanyBanner, updateCompanyBannerForEmployer);

// New: Subscription routes
router.get('/subscription', authenticateToken, getSubscriptionInfo);
router.post('/subscription/upgrade', authenticateToken, upgradeSubscription);

// Public routes
router.get('/', getAllEmployers);
router.get('/:id', getEmployerById);

// Protected routes
router.post('/', authenticateToken, createEmployer);
router.put('/:id', authenticateToken, updateEmployer);
router.delete('/:id', authenticateToken, deleteEmployer);

module.exports = router;