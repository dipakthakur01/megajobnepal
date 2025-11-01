const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

function validateAbout(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) errors.push('title is required');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('about_info').find({}).sort({ updated_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('about_info').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateAbout(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      content: req.body.content || '',
      hero_image_url: req.body.hero_image_url || ''
    };
    const result = await db.collection('about_info').insertOne(doc);
    const created = await db.collection('about_info').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateAbout({ title: req.body.title || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      content: req.body.content || '',
      hero_image_url: req.body.hero_image_url || ''
    } };
    const result = await db.collection('about_info').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('about_info').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('about_info').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;