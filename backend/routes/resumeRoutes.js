const express = require('express');
const router = express.Router();
// Use the correct middleware filename
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getUserResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  generateResumeShareToken,
  getSharedResume,
  exportResumePDF,
  exportResumeDOCX,
  exportResumePDFByBody,
  exportResumeDOCXByBody,
  exportSharedResumePDF,
  exportSharedResumeDOCX,
} = require('../controllers/resumeController');

// Public shared resume routes
router.get('/shared/:token', getSharedResume);
router.get('/shared/:token/export/pdf', exportSharedResumePDF);
router.get('/shared/:token/export/docx', exportSharedResumeDOCX);

// Authenticated resume routes
router.use(authenticateToken);

router.get('/', getUserResumes);
router.get('/:id', getResumeById);
router.post('/', createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// Export routes
router.get('/:id/export/pdf', exportResumePDF);
router.get('/:id/export/docx', exportResumeDOCX);
router.post('/export/pdf', exportResumePDFByBody);
router.post('/export/docx', exportResumeDOCXByBody);

// Share token generation
router.post('/:id/share-token', generateResumeShareToken);

module.exports = router;