const { getDB } = require('../config/db');

// Simple content controller for Blogs and News
// Provides bulk save endpoints used by current admin UI and public list endpoints

// GET /api/content/blogs
async function getBlogs(req, res) {
  try {
    const db = getDB();
    const { status, search, category, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }, { author: rx }];
    }

    const blogs = await db.collection('blogs')
      .find(filter)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('blogs').countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/content/blogs (bulk replace) (protected - super_admin)
async function saveBlogs(req, res) {
  try {
    const db = getDB();
    const { blogs } = req.body || {};
    if (!Array.isArray(blogs)) {
      return res.status(400).json({ error: 'Blogs array is required' });
    }
    // Replace collection contents
    await db.collection('blogs').deleteMany({});
    for (const b of blogs) {
      const doc = { ...b, created_at: new Date(), updated_at: new Date() };
      await db.collection('blogs').insertOne(doc);
    }
    const saved = await db.collection('blogs').find({}).sort({ publishDate: -1 }).toArray();
    res.json({ message: 'Blogs saved', blogs: saved });
  } catch (error) {
    console.error('Save blogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/content/news
async function getNews(req, res) {
  try {
    const db = getDB();
    const { status, search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }, { author: rx }];
    }

    const news = await db.collection('news')
      .find(filter)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('news').countDocuments(filter);

    res.json({
      news,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/content/news (bulk replace) (protected - super_admin)
async function saveNews(req, res) {
  try {
    const db = getDB();
    const { news } = req.body || {};
    if (!Array.isArray(news)) {
      return res.status(400).json({ error: 'News array is required' });
    }
    await db.collection('news').deleteMany({});
    for (const n of news) {
      await db.collection('news').insertOne({ ...n, created_at: new Date(), updated_at: new Date() });
    }
    const saved = await db.collection('news').find({}).sort({ publishDate: -1 }).toArray();
    res.json({ message: 'News saved', news: saved });
  } catch (error) {
    console.error('Save news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getBlogs,
  saveBlogs,
  getNews,
  saveNews
};