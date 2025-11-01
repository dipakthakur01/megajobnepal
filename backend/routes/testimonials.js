const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { uploadImage, uploadProfileImage: uploadProfileImageMiddleware } = require('../utils/uploadHelper');

function validateTestimonial(body) {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('name required');
  if (!body.text || String(body.text).trim().length < 2) errors.push('text required');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('testimonials').find({}).sort({ created_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('testimonials').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

// Create testimonial (super admin only)
router.post('/', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const errors = validateTestimonial(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      id: uuidv4(),
      name: req.body.name,
      role: req.body.role || '',
      company: req.body.company || '',
      avatar_url: req.body.avatar_url || '',
      text: req.body.text,
      created_at: new Date(),
      updated_at: new Date()
    };
    await db.collection('testimonials').insertOne(doc);
    const created = await db.collection('testimonials').findOne({ id: doc.id });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// Update testimonial (super admin only)
router.put('/:id', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const update = { $set: {
      name: req.body.name,
      role: req.body.role || '',
      company: req.body.company || '',
      avatar_url: req.body.avatar_url || '',
      text: req.body.text,
      updated_at: new Date()
    } };
    const result = await db.collection('testimonials').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('testimonials').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

// Delete testimonial (super admin only)
router.delete('/:id', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('testimonials').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Upload avatar image for a testimonial (super admin only)
router.post(
  '/:id/upload-avatar',
  authenticateToken,
  requireRole('super_admin'),
  uploadImage.single('image'),
  uploadProfileImageMiddleware,
  async (req, res, next) => {
    try {
      const db = getDB();
      const upload = req.uploadResult;
      const url = upload?.secure_url || upload?.url;
      if (!url) return res.status(500).json({ error: 'Upload failed' });

      const result = await db.collection('testimonials').updateOne(
        { id: req.params.id },
        { $set: { avatar_url: url, updated_at: new Date() } }
      );
      if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
      const updated = await db.collection('testimonials').findOne({ id: req.params.id });
      res.json({ url, testimonial: updated });
    } catch (e) { next(e); }
  }
);

module.exports = router;