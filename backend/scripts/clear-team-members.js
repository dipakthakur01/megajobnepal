// Backend maintenance script: clear the team_members table
// Usage: node backend/scripts/clear-team-members.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectToMySQL, getDB } = require('../config/db');

async function main() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToMySQL();
    const db = getDB();

    const collection = db.collection('team_members');

    const beforeCount = await collection.countDocuments({});
    console.log(`📊 Current team members count: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log('ℹ️ No team members to delete. Exiting.');
      process.exit(0);
      return;
    }

    console.log('🧹 Collecting all team member IDs...');
    const docs = await collection.find({}).project({ _id: 1 }).toArray();
    const ids = docs.map(d => d._id).filter(Boolean);
    console.log(`🗂️ Collected ${ids.length} IDs`);

    console.log('🧹 Deleting all team members (attempt 1: _id.$in)...');
    let result = await collection.deleteMany({ _id: { $in: ids } });
    console.log(`🗑️ Deleted count (reported): ${result.deletedCount}`);

    if (!result.deletedCount && ids.length) {
      console.log('🔁 Fallback: Deleting via id with $or...');
      const orFilter = { $or: ids.map(id => ({ id })) };
      result = await collection.deleteMany(orFilter);
      console.log(`🗑️ Deleted count (reported via $or): ${result.deletedCount}`);
    }

    const afterCount = await collection.countDocuments({});
    console.log(`✅ Cleared team members. Remaining count: ${afterCount}`);

    if (afterCount !== 0) {
      console.warn('⚠️ Some records may remain due to constraints. Please verify or rerun.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing team members:', err);
    process.exit(1);
  }
}

main();