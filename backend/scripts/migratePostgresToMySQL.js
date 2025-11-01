// One-shot migration from Postgres (legacy) to MySQL (current)
// Usage: node backend/scripts/migratePostgresToMySQL.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { v4: uuidv4 } = require('uuid');
const { connectToMySQL, getPool, createIndexes } = require('../config/db');
const { Pool: PgPool } = require('pg');

// Resolve Postgres connection
function buildPgConfig() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URI;
  if (url) return { connectionString: url };
  return {
    host: process.env.PGHOST || process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
    user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.POSTGRES_DB_NAME || 'megajob_db'
  };
}

async function pgTableExists(pg, table) {
  const q = `SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = $1
  ) AS exists`;
  const res = await pg.query(q, [table]);
  return Boolean(res.rows?.[0]?.exists);
}

async function fetchAllRows(pg, table) {
  const res = await pg.query(`SELECT * FROM ${table}`);
  return res.rows || [];
}

function normalizeRow(table, row) {
  // Try to preserve original identifiers and timestamps
  const id = row.id || row._id || uuidv4();
  const createdAt = row.created_at || row.createdAt || row.created_on || new Date();
  const updatedAt = row.updated_at || row.updatedAt || row.updated_on || createdAt || new Date();

  // Avoid duplicating id inside JSON body; adapter sets _id from row.id
  const { id: _omitId, _id: _omitUnderscoreId, ...rest } = row;

  const doc = {
    ...rest,
    _id: id,
    created_at: createdAt instanceof Date ? createdAt : new Date(createdAt),
    updated_at: updatedAt instanceof Date ? updatedAt : new Date(updatedAt)
  };

  return {
    id,
    data: doc,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

async function migrateTable(pg, mysqlPool, table) {
  const exists = await pgTableExists(pg, table);
  if (!exists) {
    console.log(`⚠️  Skipping '${table}' — table not found in Postgres`);
    return { migrated: 0 };
  }

  const rows = await fetchAllRows(pg, table);
  if (!rows.length) {
    console.log(`ℹ️  '${table}' is empty — nothing to migrate`);
    return { migrated: 0 };
  }

  console.log(`➡️  Migrating ${rows.length} rows from '${table}'...`);
  await mysqlPool.query('START TRANSACTION');
  let migrated = 0;
  try {
    for (const row of rows) {
      const doc = normalizeRow(table, row);
      const sql = `INSERT INTO \`${table}\` (id, data, created_at, updated_at)
                   VALUES (?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`;
      await mysqlPool.query(sql, [doc.id, JSON.stringify(doc.data), doc.created_at, doc.updated_at]);
      migrated++;
    }
    await mysqlPool.query('COMMIT');
    console.log(`✅ '${table}' migrated: ${migrated}/${rows.length}`);
    return { migrated };
  } catch (err) {
    await mysqlPool.query('ROLLBACK');
    console.error(`❌ Migration failed for '${table}':`, err.message);
    throw err;
  }
}

async function main() {
  console.log('🔧 Starting Postgres → MySQL migration...');
  console.log('📌 PG:', process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PGDATABASE);
  console.log('📌 MySQL:', process.env.MYSQL_URL || process.env.MYSQL_DATABASE || process.env.MYSQL_DB_NAME);

  // Connect to Postgres
  const pgConfig = buildPgConfig();
  const pg = new PgPool(pgConfig);
  await pg.query('SELECT 1');
  console.log('✅ Connected to Postgres');

  // Connect to MySQL and ensure tables exist
  await connectToMySQL();
  const mysqlPool = getPool();

  // Order matters to preserve references when present
  const tables = [
    'users',
    'employers',
    'companies',
    'jobs',
    'applications',
    'resumes',
    'otps',
    'company_parameters'
  ];

  const results = {};
  for (const t of tables) {
    try {
      results[t] = await migrateTable(pg, mysqlPool, t);
    } catch (e) {
      results[t] = { migrated: 0, error: e.message };
    }
  }

  // Best-effort: ensure indexes exist after migration
  try {
    await createIndexes();
  } catch (e) {
    console.warn('⚠️ Index creation post-migration warned:', e.message);
  }

  // Summarize
  console.log('\n📒 Migration summary:');
  for (const [table, info] of Object.entries(results)) {
    if (info?.error) {
      console.log(`- ${table}: failed — ${info.error}`);
    } else {
      console.log(`- ${table}: migrated ${info.migrated}`);
    }
  }

  // Clean up
  await pg.end();
  console.log('\n🎉 Migration complete.');
}

main().catch(err => {
  console.error('Unexpected migration error:', err);
  process.exitCode = 1;
  process.exit(1);
});