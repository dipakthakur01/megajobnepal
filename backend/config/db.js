const mysql = require('mysql2/promise');
const { MySQLAdapter } = require('../utils/mysqlAdapter');
const { InMemoryAdapter } = require('../utils/inMemoryAdapter');

let pool;
let db;

async function ensureDatabaseExists({ host, port, user, password, database }) {
  // Create a temporary pool without specifying database to ensure it exists
  const tempPool = mysql.createPool({
    host,
    port,
    user,
    password,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });
  try {
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`✅ Database '${database}' ensured`);
  } catch (err) {
    console.error('❌ Failed to ensure database:', err);
    throw err;
  } finally {
    await tempPool.end();
  }
}

async function connectToMySQL() {
  try {
    const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
    const host = process.env.MYSQL_HOST || '127.0.0.1';
    const port = Number(process.env.MYSQL_PORT || 3306);
    const user = process.env.MYSQL_USER || 'megajob';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || process.env.MYSQL_DB_NAME || 'megajob_db';

    console.log('🔗 Connecting to MySQL...');

    // Ensure the target database exists before creating a pool bound to it
    const skipCreate = String(
      process.env.MYSQL_SKIP_CREATE_DB ||
      process.env.SKIP_DB_CREATE ||
      (process.env.NODE_ENV === 'production' ? 'true' : 'false')
    ).toLowerCase() === 'true';

    if (!skipCreate) {
      await ensureDatabaseExists({ host, port, user, password, database });
    } else {
      console.log(
        `ℹ️ Skipping database creation check for '${database}' (MYSQL_SKIP_CREATE_DB=${process.env.MYSQL_SKIP_CREATE_DB || 'unset'})`
      );
    }

    if (url) {
      pool = mysql.createPool(url);
    } else {
      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }

    await pool.query('SELECT 1');
    db = new MySQLAdapter(pool);
    console.log('✅ Connected to MySQL successfully');

    await createTablesIfNotExist();
    await createIndexes();
    return db;
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    // Dev fallback: allow running without MySQL to avoid 500s
    // Default behavior: in production, DO NOT fall back to memory unless explicitly enabled.
    const defaultFallback = (process.env.NODE_ENV === 'production') ? 'false' : 'true';
    const allowFallback = String(process.env.ALLOW_DEV_MEMORY_FALLBACK || defaultFallback).toLowerCase() !== 'false';
    if (allowFallback) {
      console.warn('⚠️ Falling back to in-memory database. Data will NOT persist.');
      console.warn('   Set ALLOW_DEV_MEMORY_FALLBACK=false and configure MySQL env to persist.');
      db = new InMemoryAdapter();
      pool = null; // no pool in memory mode
      return db;
    }
    // If fallback is disabled, crash fast so deployment surfaces config issues
    throw error;
  }
}

async function createTablesIfNotExist() {
  if (!pool) {
    // In-memory mode: nothing to do
    console.log('ℹ️ Skipping table creation in in-memory mode');
    return;
  }
  const statements = [
    // Base schema: table with id (PK), JSON data, created_at, updated_at
    `CREATE TABLE IF NOT EXISTS \`users\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`employers\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`companies\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`jobs\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`applications\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`resumes\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`otps\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    // Password reset tokens
    `CREATE TABLE IF NOT EXISTS \`password_resets\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`company_parameters\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    // New content tables
    `CREATE TABLE IF NOT EXISTS \`about_info\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`team_members\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`blogs\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`news\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`recruitment\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`updates\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`video_settings\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    // Site-wide section settings (CMS-like)
    `CREATE TABLE IF NOT EXISTS \`site_settings\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    // UI-managed CMS tables for admin dashboard
    `CREATE TABLE IF NOT EXISTS \`categories\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`roles\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`contacts\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`testimonials\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`,
    `CREATE TABLE IF NOT EXISTS \`footer\` (id VARCHAR(36) PRIMARY KEY, data JSON, created_at DATETIME, updated_at DATETIME)`
  ];
  for (const s of statements) {
    await pool.query(s);
  }
  console.log('✅ MySQL tables ensured');
}

async function createIndexes() {
  if (!pool) {
    console.log('ℹ️ Skipping index creation in in-memory mode');
    return;
  }
  // Helper: create index only if missing (avoids IF NOT EXISTS incompatibility)
  async function ensureIndex({ table, indexName, expr, unique = false }) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
        [table, indexName]
      );
      const exists = rows && rows[0] && Number(rows[0].cnt) > 0;
      if (exists) {
        return false;
      }
      const sql = `${unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX'} ${indexName} ON \`${table}\` (${expr})`;
      await pool.query(sql);
      console.log(`✅ Created index ${indexName} on ${table}`);
      return true;
    } catch (err) {
      console.warn(`⚠️ Index '${indexName}' on '${table}' warning:`, err.message);
      return false;
    }
  }

  const indexes = [
    // Users: email, user_type
    { table: 'users', indexName: 'idx_users_email', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.email\'))))' },
    { table: 'users', indexName: 'idx_users_user_type', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.user_type\'))))' },

    // Jobs: category_id, company_id, status, approval_status, tier, created_at
    { table: 'jobs', indexName: 'idx_jobs_category_id', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.category_id\'))))' },
    { table: 'jobs', indexName: 'idx_jobs_company_id', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.company_id\'))))' },
    { table: 'jobs', indexName: 'idx_jobs_status', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.status\'))))' },
    { table: 'jobs', indexName: 'idx_jobs_approval_status', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.approval_status\'))))' },
    { table: 'jobs', indexName: 'idx_jobs_tier', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.tier\'))))' },
    { table: 'jobs', indexName: 'idx_jobs_created_at', expr: 'created_at' },

    // Companies: name
    { table: 'companies', indexName: 'idx_companies_name', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.name\'))))' },

    // Applications: job_id, job_seeker_id, status, applied_at(created_at)
    { table: 'applications', indexName: 'idx_applications_job_id', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.job_id\'))))' },
    { table: 'applications', indexName: 'idx_applications_job_seeker_id', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.job_seeker_id\'))))' },
    { table: 'applications', indexName: 'idx_applications_status', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.status\'))))' },
    { table: 'applications', indexName: 'idx_applications_applied_at', expr: 'created_at' },

    // OTPs: email, expiresAt
    { table: 'otps', indexName: 'idx_otps_email', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.email\'))))' },
    { table: 'otps', indexName: 'idx_otps_expires_at', expr: '((JSON_UNQUOTE(JSON_EXTRACT(data, \'$.expiresAt\'))))' }
  ];

  for (const spec of indexes) {
    await ensureIndex(spec);
  }
  console.log('✅ MySQL indexes ensured');
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectToMySQL() first.');
  }
  return db;
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not connected. Call connectToMySQL() first.');
  }
  return pool;
}

module.exports = {
  connectToMySQL,
  // Back-compat for any scripts still importing Postgres function name
  connectToPostgres: connectToMySQL,
  getDB,
  getPool,
  createIndexes
};