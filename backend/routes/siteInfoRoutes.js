const express = require('express');
const router = express.Router();
const { getAboutInfo, updateAboutInfo, getTeamMembers, saveTeamMembers, uploadTeamMemberImage } = require('../controllers/siteInfoController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { uploadImage, uploadProfileImage: uploadProfileImageMiddleware } = require('../utils/uploadHelper');

// Public endpoints
router.get('/about', getAboutInfo);
router.get('/team-members', getTeamMembers);

// Protected endpoints (super admin)
router.put('/about', authenticateToken, requireRole('super_admin'), updateAboutInfo);
router.put('/team-members', authenticateToken, requireRole('super_admin'), saveTeamMembers);

// Upload endpoint for team member profile images (super admin)
router.post(
  '/team-members/upload-image',
  authenticateToken,
  requireRole('super_admin'),
  uploadImage.single('image'),
  uploadProfileImageMiddleware,
  uploadTeamMemberImage
);

module.exports = router;