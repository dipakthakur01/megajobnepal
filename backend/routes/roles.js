const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

function validateRole(body) {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('name is required');
  if (!body.slug || !/^[-a-z0-9]+$/.test(String(body.slug))) errors.push('slug must be kebab-case');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('roles').find({}).sort({ name: 1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('roles').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateRole(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      name: req.body.name,
      slug: req.body.slug,
      category_id: req.body.category_id || null,
      description: req.body.description || ''
    };
    const result = await db.collection('roles').insertOne(doc);
    const created = await db.collection('roles').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateRole({ name: req.body.name || 'x', slug: req.body.slug || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      name: req.body.name,
      slug: req.body.slug,
      category_id: req.body.category_id || null,
      description: req.body.description || ''
    } };
    const result = await db.collection('roles').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('roles').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('roles').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;