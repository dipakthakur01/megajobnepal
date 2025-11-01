require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectToMySQL, getDB } = require('../config/db');

async function createAdmin() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();

    const email = 'admin@test.com';
    const rawPassword = 'password123';
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
            user_type: 'admin',
            is_verified: true,
            updated_at: now
          }
        }
      );
      console.log('🔁 Existing user updated to admin successfully');
      console.log(`Email: ${email}`);
      console.log(`Password: ${rawPassword}`);
      process.exit(0);
      return;
    }

    const adminUser = {
      email,
      password: hashedPassword,
      user_type: 'admin',
      full_name: 'Admin User',
      phone: '9800000003',
      is_verified: true,
      created_at: now,
      updated_at: now
    };

    const res = await db.collection('users').insertOne(adminUser);

    console.log('✅ Admin user created successfully');
    console.log('User ID:', res.insertedId);
    console.log(`Email: ${email}`);
    console.log(`Password: ${rawPassword}`);
    console.log('User Type: admin');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

createAdmin();