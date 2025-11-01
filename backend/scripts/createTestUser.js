require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectToMySQL, getDB } = require('../config/db');

async function createTestUser() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();

    const email = 'testjobseeker@test.com';
    const password = 'password123';

    // Check if test user already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log('✅ Test job seeker user already exists');
      console.log('Email:', email);
      console.log('Password:', password);
      process.exit(0);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = {
      email,
      password: hashedPassword,
      user_type: 'job_seeker',
      first_name: 'Test',
      last_name: 'JobSeeker',
      phone: '9800000000',
      is_verified: true,
      created_at: now,
      updated_at: now
    };

    const res = await db.collection('users').insertOne(user);

    console.log('✅ Test job seeker user created successfully');
    console.log('User ID:', res.insertedId);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User Type: job_seeker');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

createTestUser();