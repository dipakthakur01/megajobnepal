const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

function validateVideo(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) errors.push('title is required');
  if (!body.video_url || String(body.video_url).trim().length < 5) errors.push('video_url is required');
  return errors;
}

function ensureAdmin(req, res, next) {
  const role = req?.user?.user_type;
  if (role === 'admin' || role === 'super_admin') return next();
  return res.status(403).json({ error: 'Forbidden: admin only' });
}

// Treat video settings as list of entries; latest one can be used on homepage
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('video_settings').find({}).sort({ updated_at: -1, created_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('video_settings').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateVideo(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      title: req.body.title,
      description: req.body.description || '',
      video_url: req.body.video_url,
      poster_image_url: req.body.poster_image_url || '',
      autoplay: !!req.body.autoplay,
      muted: !!req.body.muted
    };
    const result = await db.collection('video_settings').insertOne(doc);
    const created = await db.collection('video_settings').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateVideo({ title: req.body.title || 'x', video_url: req.body.video_url || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      title: req.body.title,
      description: req.body.description || '',
      video_url: req.body.video_url,
      poster_image_url: req.body.poster_image_url || '',
      autoplay: !!req.body.autoplay,
      muted: !!req.body.muted
    } };
    const result = await db.collection('video_settings').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('video_settings').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('video_settings').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;