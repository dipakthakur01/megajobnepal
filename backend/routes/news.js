const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

function validateNews(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) errors.push('title is required');
  return errors;
}

function ensureAdmin(req, res, next) {
  const role = req?.user?.user_type;
  if (role === 'admin' || role === 'super_admin') return next();
  return res.status(403).json({ error: 'Forbidden: admin only' });
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('news').find({}).sort({ published_at: -1, created_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('news').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateNews(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      title: req.body.title,
      slug: req.body.slug || '',
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      image_url: req.body.image_url || '',
      published: !!req.body.published,
      published_at: req.body.published ? new Date() : null
    };
    const result = await db.collection('news').insertOne(doc);
    const created = await db.collection('news').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateNews({ title: req.body.title || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      title: req.body.title,
      slug: req.body.slug || '',
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      image_url: req.body.image_url || '',
      published: !!req.body.published,
      published_at: req.body.published ? (req.body.published_at ? new Date(req.body.published_at) : new Date()) : null
    } };
    const result = await db.collection('news').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('news').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('news').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;