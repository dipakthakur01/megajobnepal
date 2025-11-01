const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

function validateBlog(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) errors.push('title is required');
  if (!body.slug || !/^[-a-z0-9]+$/.test(String(body.slug))) errors.push('slug must be kebab-case');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('blogs').find({}).sort({ created_at: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('blogs').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateBlog(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      cover_image_url: req.body.cover_image_url || '',
      published: !!req.body.published,
      published_at: req.body.published ? new Date() : null
    };
    const result = await db.collection('blogs').insertOne(doc);
    const created = await db.collection('blogs').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateBlog({ title: req.body.title || 'x', slug: req.body.slug || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const update = { $set: {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      cover_image_url: req.body.cover_image_url || '',
      published: !!req.body.published,
      published_at: req.body.published ? (req.body.published_at ? new Date(req.body.published_at) : new Date()) : null
    } };
    const result = await db.collection('blogs').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('blogs').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('blogs').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;