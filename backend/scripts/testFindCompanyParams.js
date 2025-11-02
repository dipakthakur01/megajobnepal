const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {}
const { connectToMySQL, getDB, getPool } = require('../config/db');

(async () => {
  try {
    await connectToMySQL();
    const db = getDB();
    const items = await db
      .collection('company_parameters')
      .find({ type: 'industry', status: { $ne: 'deleted' } })
      .sort({ name: 1 })
      .toArray();
    console.log('Found items count:', items.length);
    console.log(items);
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, JSON_UNQUOTE(JSON_EXTRACT(data,'$.type')) as type, JSON_UNQUOTE(JSON_EXTRACT(data,'$.status')) as status, JSON_UNQUOTE(JSON_EXTRACT(data,'$.name')) as name FROM company_parameters WHERE JSON_UNQUOTE(JSON_EXTRACT(data,'$.type')) = 'industry' AND JSON_UNQUOTE(JSON_EXTRACT(data,'$.status')) <> 'deleted' ORDER BY JSON_UNQUOTE(JSON_EXTRACT(data,'$.name')) ASC"
    );
    console.log('Direct SQL rows:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error during testFindCompanyParams:', err);
    process.exit(1);
  }
})();