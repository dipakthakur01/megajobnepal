require('dotenv').config();
const { connectToMySQL, getDB } = require('../config/db');

async function checkTestUser() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();

    const email = 'testjobseeker@test.com';
    const user = await db.collection('users').findOne({ email });

    if (user) {
      console.log('✅ Test user found:');
      console.log('Email:', user.email);
      console.log('User Type:', user.user_type);
      console.log('First Name:', user.first_name);
      console.log('Last Name:', user.last_name);
      console.log('Is Verified:', user.is_verified);
      console.log('Created At:', user.created_at);
      console.log('Full user object:', JSON.stringify(user, null, 2));
    } else {
      console.log('❌ Test user not found');
    }
  } catch (error) {
    console.error('❌ Error checking test user:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

checkTestUser();