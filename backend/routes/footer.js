const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

function validateFooter(body) {
  const errors = [];
  if (!body.text || String(body.text).trim().length < 2) errors.push('text required');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('footer').find({}).sort({ updated_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('footer').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateFooter(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      text: req.body.text,
      links: Array.isArray(req.body.links) ? req.body.links : [] // [{label,url}]
    };
    const result = await db.collection('footer').insertOne(doc);
    const created = await db.collection('footer').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const update = { $set: {
      text: req.body.text,
      links: Array.isArray(req.body.links) ? req.body.links : []
    } };
    const result = await db.collection('footer').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('footer').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('footer').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;