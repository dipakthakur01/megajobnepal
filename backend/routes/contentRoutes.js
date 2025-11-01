const express = require('express');
const router = express.Router();
const { getBlogs, saveBlogs, getNews, saveNews } = require('../controllers/contentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/blogs', getBlogs);
router.get('/news', getNews);

// Protected endpoints (super admin)
router.put('/blogs', authenticateToken, requireRole('super_admin'), saveBlogs);
router.put('/news', authenticateToken, requireRole('super_admin'), saveNews);

module.exports = router;