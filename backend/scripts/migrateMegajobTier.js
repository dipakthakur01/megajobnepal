// Migration: normalize job tier from 'mega_job' to canonical 'megajob'
// Usage: node scripts/migrateMegajobTier.js
// Ensures both 'tier' and legacy 'job_tier' fields are updated, and sets 'tier' if missing.

require('dotenv').config();
const { connectToMySQL, getDB } = require('../config/db');

async function run() {
  console.log('🚚 Starting MegaJob tier migration (mega_job → megajob)...');
  await connectToMySQL();
  const db = getDB();

  // 1) Update jobs where 'tier' is legacy 'mega_job' or case variants
  const res1 = await db.collection('jobs').updateMany(
    { tier: { $in: ['mega_job', 'MegaJob', 'MEGA_JOB'] } },
    { $set: { tier: 'megajob' } }
  );
  console.log(`✅ Updated 'tier' field: matched=${res1.matchedCount}, modified=${res1.modifiedCount}`);

  // 2) Update jobs where legacy 'job_tier' exists as 'mega_job'; also ensure 'tier' is set
  const res2 = await db.collection('jobs').updateMany(
    { job_tier: { $in: ['mega_job', 'MegaJob', 'MEGA_JOB'] } },
    { $set: { job_tier: 'megajob', tier: 'megajob' } }
  );
  console.log(`✅ Updated 'job_tier' field and ensured 'tier': matched=${res2.matchedCount}, modified=${res2.modifiedCount}`);

  // 3) Optional: if any jobs have 'tier' capitalized variants of megajob, normalize to lowercase
  const res3 = await db.collection('jobs').updateMany(
    { tier: { $in: ['MegaJob', 'MEGAJOB'] } },
    { $set: { tier: 'megajob' } }
  );
  console.log(`✅ Normalized case variants: matched=${res3.matchedCount}, modified=${res3.modifiedCount}`);

  console.log('🎉 Migration complete. MegaJob tiers normalized to "megajob".');
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});