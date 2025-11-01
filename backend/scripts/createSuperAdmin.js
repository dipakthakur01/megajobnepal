require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectToMySQL, getDB } = require('../config/db');

async function createSuperAdmin() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();

    const email = 'rustamchupa473@gmail.com';
    const rawPassword = 'Deepakrajput@321';
    const now = new Date();

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Check if the user already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      await db.collection('users').updateOne(
        { email },
        {
          $set: {
            email,
            password: hashedPassword,
            user_type: 'super_admin',
            is_verified: true,
            updated_at: now
          }
        }
      );
      console.log('🔁 Existing user updated to super_admin successfully');
      console.log(`Email: ${email}`);
      console.log(`Password: ${rawPassword}`);
      process.exit(0);
      return;
    }

    const superAdmin = {
      email,
      password: hashedPassword,
      user_type: 'super_admin',
      full_name: 'Super Admin',
      phone: '9800000002',
      is_verified: true,
      created_at: now,
      updated_at: now
    };

    const res = await db.collection('users').insertOne(superAdmin);

    console.log('✅ Super-admin user created successfully');
    console.log('User ID:', res.insertedId);
    console.log(`Email: ${email}`);
    console.log(`Password: ${rawPassword}`);
    console.log('User Type: super_admin');
  } catch (error) {
    console.error('❌ Error creating super-admin user:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();