require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectToMySQL, getDB } = require('../config/db');

async function createTestEmployer() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();

    const email = 'testemployer@test.com';
    const password = 'password123';

    // Check if test employer already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log('✅ Test employer user already exists');
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
      user_type: 'employer',
      first_name: 'Test',
      last_name: 'Employer',
      phone: '9800000001',
      is_verified: true,
      created_at: now,
      updated_at: now,
      company: {
        name: 'Test Company Ltd',
        industry: 'Technology',
        location: 'Kathmandu, Nepal',
        website: 'https://testcompany.com',
        description: 'A test company for demonstration purposes'
      }
    };

    const res = await db.collection('users').insertOne(user);

    console.log('✅ Test employer user created successfully');
    console.log('User ID:', res.insertedId);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User Type: employer');
    console.log('Company: Test Company Ltd');
  } catch (error) {
    console.error('❌ Error creating test employer:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

createTestEmployer();