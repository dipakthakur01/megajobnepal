const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  sendOtp,
  signup,
  verifyOtp,
  forgotPassword,
  resetPassword,
  sendPasswordChangeOtp,
  changePasswordWithOtp
} = require('../controllers/authController');

// Public routes
// router.post('/register', register); // Removed: bypasses OTP verification
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// OTP-based password reset (general users)
router.post('/send-password-change-otp', sendPasswordChangeOtp);
router.post('/change-password-with-otp', changePasswordWithOtp);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;