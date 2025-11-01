const { getDB } = require('../config/db');

const VALID_TYPES = ['industry', 'company_type'];

function validateType(type) {
  return VALID_TYPES.includes(type);
}

// GET /api/company-parameters/:type
async function getParameters(req, res) {
  try {
    const { type } = req.params;
    if (!validateType(type)) {
      return res.status(400).json({ error: 'Invalid parameter type' });
    }

    const db = getDB();
    const items = await db
      .collection('company_parameters')
      .find({ type, status: { $ne: 'deleted' } })
      .sort({ name: 1 })
      .toArray();

    res.json({ items });
  } catch (error) {
    console.error('getParameters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/company-parameters/:type
async function createParameter(req, res) {
  try {
    const { type } = req.params;
    const { name, description, range, status } = req.body || {};

    if (!validateType(type)) {
      return res.status(400).json({ error: 'Invalid parameter type' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDB();
    const existing = await db
      .collection('company_parameters')
      .findOne({ type, name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(409).json({ error: 'Parameter with this name already exists' });
    }

    const now = new Date();
    const doc = {
      type,
      name: name.trim(),
      description: description || '',
      range: range || null,
      status: status || 'active',
      usage: 0,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection('company_parameters').insertOne(doc);
    res.status(201).json({ item: { ...doc, _id: result.insertedId } });
  } catch (error) {
    console.error('createParameter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/company-parameters/:type/:id
async function updateParameter(req, res) {
  try {
    const { type, id } = req.params;
    const { name, description, range, status } = req.body || {};
    if (!validateType(type)) {
      return res.status(400).json({ error: 'Invalid parameter type' });
    }
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    const db = getDB();
    const update = {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(range !== undefined ? { range } : {}),
      ...(status ? { status } : {}),
      updated_at: new Date(),
    };

    const updated = await db
      .collection('company_parameters')
      .findOneAndUpdate(
        { _id: id, type },
        { $set: update },
        { returnDocument: 'after' }
      );

    if (!updated) {
      return res.status(404).json({ error: 'Parameter not found' });
    }
    res.json({ item: updated });
  } catch (error) {
    console.error('updateParameter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/company-parameters/:type/:id
async function deleteParameter(req, res) {
  try {
    const { type, id } = req.params;
    if (!validateType(type)) {
      return res.status(400).json({ error: 'Invalid parameter type' });
    }
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    const db = getDB();
    const result = await db
      .collection('company_parameters')
      .deleteOne({ _id: id, type });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Parameter not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('deleteParameter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getParameters,
  createParameter,
  updateParameter,
  deleteParameter,
};