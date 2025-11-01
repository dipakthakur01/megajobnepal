const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { uploadImage, uploadCompanyLogo: uploadCompanyLogoMiddleware } = require('../utils/uploadHelper');

function validateCategory(body) {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('name is required');
  if (!body.slug || !/^[-a-z0-9]+$/.test(String(body.slug))) errors.push('slug must be kebab-case');
  return errors;
}

// Public: list categories (used by homepage scrolling and filters)
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

// Public: job counts per category (used by homepage tiles)
router.get('/stats', async (req, res, next) => {
  try {
    const db = getDB();
    const idsParam = String(req.query.ids || '').trim();
    const filterIds = idsParam ? idsParam.split(',').map(s => s.trim()).filter(Boolean) : null;

    const categories = await db.collection('categories').find({}).project({ id: 1, name: 1, icon_url: 1, slug: 1 }).toArray();
    const catMap = new Map(categories.map(c => [String(c.id || c._id), c]));

    const jobs = await db.collection('jobs').find({ status: 'active' }).project({ category_id: 1 }).toArray();
    const counts = new Map();
    for (const j of jobs) {
      const cid = String(j.category_id || '');
      if (!cid) continue;
      counts.set(cid, (counts.get(cid) || 0) + 1);
    }

    const allIds = filterIds || Array.from(new Set([...counts.keys(), ...catMap.keys()]));
    const result = allIds.map(id => {
      const c = catMap.get(id) || { id, name: id, icon_url: '', slug: '' };
      return {
        id: String(c.id || id),
        name: c.name || id,
        slug: c.slug || '',
        icon_url: c.icon_url || '',
        jobCount: counts.get(String(c.id || id)) || counts.get(id) || 0
      };
    });

    res.json({ categories: result });
  } catch (e) { next(e); }
});

// Public: get one category by id (supports legacy _id or explicit id)
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const item = await db.collection('categories').findOne({ $or: [{ id }, { _id: id }] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

// Protected: create category (super_admin)
router.post('/', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const errors = validateCategory(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      id: uuidv4(),
      name: req.body.name,
      slug: req.body.slug,
      icon_url: req.body.icon_url || '',
      description: req.body.description || ''
    };
    await db.collection('categories').insertOne(doc);
    const created = await db.collection('categories').findOne({ id: doc.id });
    res.status(201).json(created || doc);
  } catch (e) { next(e); }
});

// Protected: update category (super_admin)
router.put('/:id', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const errors = validateCategory({ name: req.body.name || 'x', slug: req.body.slug || 'x' });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const id = String(req.params.id);
    const update = { $set: {
      name: req.body.name,
      slug: req.body.slug,
      icon_url: req.body.icon_url || '',
      description: req.body.description || ''
    } };
    const result = await db.collection('categories').updateOne({ $or: [{ id }, { _id: id }] }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('categories').findOne({ $or: [{ id }, { _id: id }] });
    res.json(updated);
  } catch (e) { next(e); }
});

// Protected: delete category (super_admin)
router.delete('/:id', authenticateToken, requireRole('super_admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const result = await db.collection('categories').deleteOne({ $or: [{ id }, { _id: id }] });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Protected: upload/update category icon (super_admin)
router.post(
  '/:id/upload-icon',
  authenticateToken,
  requireRole('super_admin'),
  uploadImage.single('icon'),
  uploadCompanyLogoMiddleware,
  async (req, res, next) => {
    try {
      const db = getDB();
      const id = String(req.params.id);
      const upload = req.uploadResult;
      const url = upload?.secure_url || upload?.url;
      if (!url) return res.status(500).json({ error: 'Upload failed' });
      const result = await db.collection('categories').findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: { icon_url: url, updated_at: new Date() } },
        { returnDocument: 'after' }
      );
      const value = result?.value || result || null;
      if (!value) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Icon updated', icon_url: url, category: value });
    } catch (e) { next(e); }
  }
);

module.exports = router;