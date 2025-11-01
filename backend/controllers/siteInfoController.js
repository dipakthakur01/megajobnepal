const { getDB } = require('../config/db');

// Default About info and default members used when DB is empty
const DEFAULT_ABOUT_INFO = {
  mission: 'To connect talented professionals with leading employers across Nepal, fostering career growth and business success.',
  vision: "To be Nepal's premier job portal, empowering careers and transforming the employment landscape.",
  story: 'Founded in 2020, MegaJobNepal emerged from a vision to revolutionize the job market in Nepal. Our founders recognized the gap between talented job seekers and quality employers, and set out to bridge this divide through innovative technology and dedicated service.',
  values: [
    { title: 'Innovation', description: 'We continuously evolve our platform to meet changing market needs.' },
    { title: 'Integrity', description: 'We maintain transparency and honesty in all our interactions.' },
    { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' },
    { title: 'Community', description: 'We are committed to building a strong professional community in Nepal.' }
  ],
  statistics: {
    totalJobs: '10,000+',
    happyClients: '5,000+',
    successfulPlacements: '15,000+',
    companiesServed: '2,500+'
  }
};

const DEFAULT_TEAM_MEMBERS = [
  {
    id: '1',
    name: 'Rajesh Sharma',
    position: 'Chief Executive Officer',
    bio: "Rajesh has over 15 years of experience in HR technology and has been instrumental in transforming Nepal's job market through digital innovation.",
    education: 'MBA - Kathmandu University',
    experience: '15+ years in HR & Tech',
    linkedin: 'https://linkedin.com/in/rajeshsharma',
    email: 'rajesh@megajobnepal.com.np',
    phone: '+977-1-4444567',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop'
  }
];

// Normalize media URL to current origin when pointing to local uploads
function normalizeMediaUrl(url, req) {
  const u = (url || '').toString().trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const origin = req?.protocol && req?.get ? `${req.protocol}://${req.get('host')}` : '';
  return origin ? `${origin}${u.startsWith('/') ? '' : '/'}${u}` : u;
}

// Helper: stable deduplication key for team members
function makeMemberKey(m) {
  const email = (m?.email || '').trim().toLowerCase();
  const linkedin = (m?.linkedin || '').trim().toLowerCase();
  const name = (m?.name || '').trim().toLowerCase();
  const position = (m?.position || '').trim().toLowerCase();
  return email || linkedin || `${name}|${position}`;
}

// GET /api/site-info/about
async function getAboutInfo(req, res) {
  try {
    const db = getDB();
    const existing = await db.collection('about_info').findOne({});
    if (!existing) {
      // Initialize with defaults on first access
      const result = await db.collection('about_info').insertOne({ ...DEFAULT_ABOUT_INFO, created_at: new Date(), updated_at: new Date() });
      const created = await db.collection('about_info').findOne({ _id: result.insertedId });
      return res.json({ about: created });
    }
    return res.json({ about: existing });
  } catch (error) {
    console.error('Get About info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/site-info/about  (protected - super_admin)
async function updateAboutInfo(req, res) {
  try {
    const db = getDB();
    const payload = req.body || {};
    const existing = await db.collection('about_info').findOne({});
    if (!existing) {
      const result = await db.collection('about_info').insertOne({ ...payload, created_at: new Date(), updated_at: new Date() });
      const created = await db.collection('about_info').findOne({ _id: result.insertedId });
      return res.json({ message: 'About info created', about: created });
    }
    await db.collection('about_info').updateOne({ _id: existing._id }, { $set: { ...payload, updated_at: new Date() } });
    const updated = await db.collection('about_info').findOne({ _id: existing._id });
    return res.json({ message: 'About info updated', about: updated });
  } catch (error) {
    console.error('Update About info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/site-info/team-members
async function getTeamMembers(req, res) {
  try {
    const db = getDB();
    const members = await db.collection('team_members').find({}).sort({ created_at: -1 }).toArray();
    const normalized = Array.isArray(members)
      ? members.map(m => ({
          ...m,
          image: normalizeMediaUrl(m?.image, req)
        }))
      : [];

    // Deduplicate on read using stable keys
    const seen = new Set();
    const unique = [];
    for (const m of normalized) {
      const key = makeMemberKey(m);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(m);
    }

    // IMPORTANT: Do NOT auto-seed defaults on GET; return empty list if none
    return res.json({ members: unique });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/site-info/team-members (replace collection) (protected - super_admin)
async function saveTeamMembers(req, res) {
  try {
    const db = getDB();
    const { members } = req.body || {};
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: 'Members array is required' });
    }

    // Normalize IDs to avoid duplicates or missing ids
    const used = new Set();
    const normalized = members.map((m, idx) => {
      const name = (m?.name || '').trim().toLowerCase();
      const position = (m?.position || '').trim().toLowerCase();
      let baseId = (m?.id || m?.email || m?.linkedin || (name || position ? `${name}|${position}` : '') || `${Date.now()}-${idx}`).toString().trim();
      let id = baseId;
      let bump = 1;
      while (used.has(id)) {
        id = `${baseId}-${bump++}`;
      }
      used.add(id);
      return { ...m, id };
    });

    // Deduplicate on save by stable keys
    const seen = new Set();
    const uniqueNormalized = [];
    for (const m of normalized) {
      const key = makeMemberKey(m);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueNormalized.push(m);
    }

    await db.collection('team_members').deleteMany({});
    for (const m of uniqueNormalized) {
      await db.collection('team_members').insertOne({ ...m, created_at: new Date(), updated_at: new Date() });
    }
    const saved = await db.collection('team_members').find({}).sort({ created_at: -1 }).toArray();
    return res.json({ message: 'Team members saved', members: saved });
  } catch (error) {
    console.error('Save team members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/site-info/team-members/upload-image (protected - super_admin)
async function uploadTeamMemberImage(req, res) {
  try {
    const result = req.uploadResult;
    if (!result) {
      return res.status(500).json({ error: 'Upload failed' });
    }
    const url = result.secure_url || result.url;
    const normalizedUrl = normalizeMediaUrl(url, req);
    return res.json({ url: normalizedUrl });
  } catch (error) {
    console.error('Upload team member image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAboutInfo,
  updateAboutInfo,
  getTeamMembers,
  saveTeamMembers,
  uploadTeamMemberImage
};