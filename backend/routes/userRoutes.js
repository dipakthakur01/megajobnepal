const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadResume
} = require('../controllers/userController');
const { uploadImage, uploadDocument, uploadProfileImage: uploadProfileImageMiddleware, uploadResume: uploadResumeMiddleware } = require('../utils/uploadHelper');

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', uploadImage.single('profileImage'), uploadProfileImageMiddleware, uploadProfileImage);
router.post('/profile/resume', uploadDocument.single('resume'), uploadResumeMiddleware, uploadResume);

module.exports = router;