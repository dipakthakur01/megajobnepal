const { getDB } = require('../config/db');

// Get section settings by section key
const getSectionSettings = async (req, res) => {
  try {
    const { section } = req.params;
    if (!section) return res.status(400).json({ error: 'Section key is required' });
    const db = getDB();

    let doc = null;
    try {
      doc = await db.collection('site_settings').findOne({ section });
    } catch (err) {
      console.warn('site_settings collection not available, serving defaults:', err.message);
      doc = null;
    }

    if (!doc) {
      const defaults = getDefaultSection(section);
      return res.json({ section, config: defaults, published: false });
    }
    const { _id, ...rest } = doc;
    return res.json(rest);
  } catch (error) {
    console.error('Get section settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List all saved sections (minimal projection)
const listSections = async (req, res) => {
  try {
    const db = getDB();
    let docs = [];
    try {
      docs = await db.collection('site_settings')
        .find({})
        .project({ section: 1, published: 1, updated_at: 1, created_at: 1 })
        .toArray();
    } catch (err) {
      console.warn('site_settings list unavailable:', err.message);
      docs = [];
    }
    return res.json({ count: docs.length, sections: docs });
  } catch (error) {
    console.error('List sections error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Upsert section settings (super_admin only)
const upsertSectionSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const { config = {}, published = true } = req.body || {};
    if (!section || typeof config !== 'object') {
      return res.status(400).json({ error: 'Section and config object are required' });
    }
    const db = getDB();
    const now = new Date();
    const payload = {
      section,
      config,
      published: Boolean(published),
      updated_at: now,
      updated_by: req.user ? (req.user.email || req.user.userId || req.user.id) : undefined
    };

    try {
      const result = await db.collection('site_settings').findOneAndUpdate(
        { section },
        { $set: payload, $setOnInsert: { created_at: now } },
        { upsert: true, returnDocument: 'after' }
      );
      const { _id, ...rest } = result || payload;
      return res.json({ message: 'Section settings saved', ...rest });
    } catch (err) {
      console.error('Upsert site_settings failed:', err.message);
      return res.status(500).json({ error: 'Persistence failed', payload });
    }
  } catch (error) {
    console.error('Upsert section settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a section settings document by section key
const deleteSectionSettings = async (req, res) => {
  try {
    const { section } = req.params;
    if (!section) return res.status(400).json({ error: 'Section key is required' });
    const db = getDB();
    try {
      const result = await db.collection('site_settings').deleteOne({ section });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Section not found' });
      return res.json({ message: 'Section deleted', section });
    } catch (err) {
      console.error('Delete site_settings failed:', err.message);
      return res.status(500).json({ error: 'Delete failed' });
    }
  } catch (error) {
    console.error('Delete section settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function getDefaultSection(section) {
  const defaults = {
    trusted_companies: {
      headingText: 'Trusted by 1000+ Companies',
      subheadingText: 'Leading organizations choose MegaJobNepal',
      textSize: 'lg',
      fontWeight: 'medium',
      textColor: '#1F2937',
      accentColor: '#3B82F6'
    },
    // New: homepage categories section (editable via /api/site/sections/homepage_categories)
    homepage_categories: {
      headingText: 'Browse Jobs by Category',
      subheadingText: 'Find opportunities in your field of expertise',
      displayStyle: 'tiles', // tiles | carousel
      showCounts: true,
      // list of category ids to show (order matters)
      categoryIds: [],
      // optional theme options
      textColor: '#111827',
      accentColor: '#3B82F6'
    },
    site_info: {
      brandName: 'MegaJobNepal',
      primaryColor: '#3B82F6',
      accentColor: '#4F46E5',
      // New: default recipient email for Contact form submissions
      contactRecipientEmail: 'support@megajobnepal.com.np'
    }
  };
  return defaults[section] || {};
}

module.exports = { getSectionSettings, upsertSectionSettings, listSections, deleteSectionSettings };