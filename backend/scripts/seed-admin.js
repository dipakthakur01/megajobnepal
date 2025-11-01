const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectToMySQL, getDB } = require('../config/db');

(async () => {
  try {
    if (String(process.env.ALLOW_SEED_ADMIN || '').toLowerCase() !== 'true') {
      console.error('❌ ALLOW_SEED_ADMIN is not set to true. Aborting.');
      process.exit(1);
    }

    await connectToMySQL();
    const db = getDB();

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const full_name = process.env.SEED_ADMIN_NAME || 'Super Admin';

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log(`ℹ️ Admin user already exists for ${email}. Skipping.`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashed,
      user_type: 'super_admin',
      full_name,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    console.log('✅ Seeded admin user:', { id: result.insertedId, email });
    console.log('🔐 Credentials:', { email, password });
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err);
    process.exit(1);
  }
})();