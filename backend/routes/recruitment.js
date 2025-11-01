const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

function validateRecruitment(body) {
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
    const items = await db.collection('recruitment').find({}).sort({ sort_order: 1, created_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('recruitment').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateRecruitment(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const now = new Date();
    const doc = {
      id: uuidv4(),
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      image_url: req.body.image_url || '',
      link_url: req.body.link_url || '',
      published: !!req.body.published,
      sort_order: Number(req.body.sort_order || 0),
      created_at: now,
      updated_at: now,
    };
    await db.collection('recruitment').insertOne(doc);
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

router.put('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const errors = validateRecruitment({ title: req.body.title || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      image_url: req.body.image_url || '',
      link_url: req.body.link_url || '',
      published: !!req.body.published,
      sort_order: Number(req.body.sort_order || 0),
      updated_at: new Date(),
    } };
    const result = await db.collection('recruitment').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('recruitment').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticateToken, ensureAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('recruitment').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;