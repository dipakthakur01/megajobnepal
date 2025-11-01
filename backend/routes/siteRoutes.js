const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { getSectionSettings, upsertSectionSettings, listSections, deleteSectionSettings } = require('../controllers/siteController');

// Add admin-or-super-admin guard for write operations
function ensureAdmin(req, res, next) {
  const role = req?.user?.user_type;
  if (role === 'admin' || role === 'super_admin') return next();
  return res.status(403).json({ error: 'Forbidden: admin only' });
}

// Configure multer disk storage for section uploads
const heroUploadDir = path.join(__dirname, '..', 'uploads', 'hero');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(heroUploadDir, { recursive: true });
    } catch {}
    cb(null, heroUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const stamp = Date.now();
    cb(null, `${base || 'hero'}-${stamp}${ext}`);
  }
});
const upload = multer({ storage });

// Public read (homepage needs to read settings)
router.get('/sections', listSections);
router.get('/sections/:section', getSectionSettings);

// Protected write (Admin or Super Admin)
router.put('/sections/:section', authenticateToken, ensureAdmin, upsertSectionSettings);
router.delete('/sections/:section', authenticateToken, ensureAdmin, deleteSectionSettings);

// Protected upload endpoint for hero images
router.post(
  '/sections/:section/upload-image',
  authenticateToken,
  ensureAdmin,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/hero/${req.file.filename}`;
      return res.json({ section: req.params.section, url: publicUrl, filename: req.file.filename, path: `/uploads/hero/${req.file.filename}` });
    } catch (err) {
      console.error('Hero upload error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  }
);

module.exports = router;