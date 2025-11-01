const { v4: uuidv4 } = require('uuid');

function quoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

function applyUpdate(doc, update, isInsert = false) {
  if (!update || typeof update !== 'object') return doc;
  const out = { ...doc };
  if (update.$set && typeof update.$set === 'object') {
    for (const [k, v] of Object.entries(update.$set)) {
      out[k] = v;
    }
  }
  if (isInsert && update.$setOnInsert && typeof update.$setOnInsert === 'object') {
    for (const [k, v] of Object.entries(update.$setOnInsert)) {
      if (out[k] === undefined) {
        out[k] = v;
      }
    }
    out.created_at = out.created_at || new Date();
  }
  out.updated_at = new Date();
  return out;
}

function buildSort(sortObj) {
  if (!sortObj || typeof sortObj !== 'object') return '';
  const entries = Object.entries(sortObj);
  if (entries.length === 0) return '';
  const [key, dir] = entries[0];
  const mapped = key === 'updatedAt' ? 'updated_at' : key === 'createdAt' ? 'created_at' : `data->>'${key}'`;
  const direction = Number(dir) === -1 ? 'DESC' : 'ASC';
  return `${mapped} ${direction}`;
}

function buildWhere(filter) {
  if (!filter || Object.keys(filter).length === 0) return { where: '', params: [] };
  const clauses = [];
  const params = [];
  let idx = 1;

  function addParam(val) {
    params.push(val);
    return `$${idx++}`;
  }

  // $or support (array of subfilters) — compose with consistent placeholders
  if (filter.$or && Array.isArray(filter.$or) && filter.$or.length) {
    const orClauses = [];

    const compileSub = (obj) => {
      const parts = [];
      // Special id handling
      if (obj._id || obj.id) {
        const raw = obj._id || obj.id;
        const idVal = typeof raw === 'string' ? raw : raw?.toString?.() || String(raw);
        parts.push(`id = ${addParam(idVal)}`);
      }
      // Operator-based filters (dates, $ne, $in)
      for (const [key, value] of Object.entries(obj)) {
        if (key === '_id' || key === 'id' || key === '$or') continue;
        if (value && typeof value === 'object' && ('$gte' in value || '$gt' in value)) {
          const col = key === 'created_at' || key === 'updated_at' ? key : `data->>'${key}'`;
          if ('$gte' in value) {
            const d = value.$gte instanceof Date ? value.$gte : new Date(value.$gte);
            parts.push(`${col} >= ${addParam(d)}`);
          } else {
            const d = value.$gt instanceof Date ? value.$gt : new Date(value.$gt);
            parts.push(`${col} > ${addParam(d)}`);
          }
          continue;
        }
        if (value && typeof value === 'object' && ('$ne' in value)) {
          const col = `data->>'${key}'`;
          const val = String(value.$ne);
          parts.push(`${col} <> ${addParam(val)}`);
          continue;
        }
        if (value && typeof value === 'object' && Array.isArray(value.$in)) {
          const arr = value.$in.map(v => String(v));
          const col = `data->>'${key}'`;
          if (arr.length === 0) {
            parts.push('FALSE');
          } else {
            const inParts = arr.map(v => `${col} = ${addParam(v)}`);
            parts.push(`(${inParts.join(' OR ')})`);
          }
          continue;
        }
      }
      // Equality and regex
      for (const [key, value] of Object.entries(obj)) {
        if (key === '_id' || key === 'id' || key === '$or') continue;
        const colExpr = `data->>'${key}'`;
        if (value instanceof RegExp) {
          const pattern = value.source;
          parts.push(`${colExpr} ILIKE ${addParam('%' + pattern + '%')}`);
        } else if (value !== undefined && value !== null) {
          parts.push(`${colExpr} = ${addParam(String(value))}`);
        }
      }
      return parts.filter(Boolean).join(' AND ');
    };

    for (const sub of filter.$or) {
      const subWhere = compileSub(sub);
      if (subWhere) orClauses.push(`(${subWhere})`);
    }
    if (orClauses.length) {
      clauses.push(orClauses.join(' OR '));
    }
  }

  // Special id handling
  if (filter._id || filter.id) {
    const raw = filter._id || filter.id;
    const idVal = typeof raw === 'string' ? raw : raw?.toString?.() || String(raw);
    clauses.push(`id = ${addParam(idVal)}`);
  }

  // Operator-based filters (dates)
  for (const [key, value] of Object.entries(filter)) {
    if (key === '_id' || key === 'id' || key === '$or') continue;
    if (value && typeof value === 'object' && ('$gte' in value || '$gt' in value)) {
      const col = key === 'created_at' || key === 'updated_at' ? key : `data->>'${key}'`;
      if ('$gte' in value) {
        const d = value.$gte instanceof Date ? value.$gte : new Date(value.$gte);
        clauses.push(`${col} >= ${addParam(d)}`);
      } else {
        const d = value.$gt instanceof Date ? value.$gt : new Date(value.$gt);
        clauses.push(`${col} > ${addParam(d)}`);
      }
      continue;
    }
    // $ne support
    if (value && typeof value === 'object' && ('$ne' in value)) {
      const col = `data->>'${key}'`;
      const val = String(value.$ne);
      clauses.push(`${col} <> ${addParam(val)}`);
      continue;
    }
    // $in support
    if (value && typeof value === 'object' && Array.isArray(value.$in)) {
      const arr = value.$in.map(v => String(v));
      const col = `data->>'${key}'`;
      if (arr.length === 0) {
        clauses.push('FALSE');
      } else {
        const parts = arr.map(v => `${col} = ${addParam(v)}`);
        clauses.push(`(${parts.join(' OR ')})`);
      }
      continue;
    }
  }

  // Equality and regex
  for (const [key, value] of Object.entries(filter)) {
    if (key === '_id' || key === 'id' || key === '$or') continue;
    const colExpr = `data->>'${key}'`;
    if (value instanceof RegExp) {
      const pattern = value.source;
      clauses.push(`${colExpr} ILIKE ${addParam('%' + pattern + '%')}`);
    } else if (value !== undefined && value !== null) {
      clauses.push(`${colExpr} = ${addParam(String(value))}`);
    }
  }

  return { where: clauses.join(' AND '), params };
}

class PgAdapter {
  constructor(pool) {
    this.pool = pool;
  }

  collection(name) {
    return new PgCollection(this.pool, name);
  }

  admin() {
    return {
      ping: async () => {
        await this.pool.query('SELECT 1');
      }
    };
  }
}

class PgCollection {
  constructor(pool, name) {
    this.pool = pool;
    this.table = name;
  }

  _rowToDoc(row) {
    const data = row.data || {};
    const doc = { ...data };
    if (!doc._id) doc._id = row.id;
    if (!doc.created_at) doc.created_at = row.created_at;
    if (!doc.updated_at) doc.updated_at = row.updated_at;
    return doc;
  }

  async findOne(filter, options = {}) {
    const { where, params } = buildWhere(filter);
    let sql = `SELECT id, data, created_at, updated_at FROM ${quoteIdent(this.table)}`;
    if (where) sql += ` WHERE ${where}`;
    sql += ' LIMIT 1';
    const res = await this.pool.query(sql, params);
    const row = res.rows[0];
    if (!row) return null;
    let doc = this._rowToDoc(row);
    // Apply projection (exclude/include fields) if provided
    if (options && options.projection && typeof options.projection === 'object') {
      const proj = options.projection;
      const hasInclude = Object.values(proj).some(v => v === 1);
      if (hasInclude) {
        const includeKeys = Object.entries(proj).filter(([,v]) => v === 1).map(([k]) => k);
        doc = Object.fromEntries(Object.entries(doc).filter(([k]) => includeKeys.includes(k)));
      } else {
        for (const [k, v] of Object.entries(proj)) {
          if (v === 0) delete doc[k];
        }
      }
    }
    return doc;
  }

  async countDocuments(filter = {}) {
    const { where, params } = buildWhere(filter);
    let sql = `SELECT COUNT(*) AS count FROM ${quoteIdent(this.table)}`;
    if (where) sql += ` WHERE ${where}`;
    const res = await this.pool.query(sql, params);
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  async insertOne(doc) {
    const id = uuidv4();
    const now = new Date();
    const docWithId = { ...doc, _id: id, created_at: doc.created_at || now, updated_at: doc.updated_at || now };
    const sql = `INSERT INTO ${quoteIdent(this.table)} (id, data, created_at, updated_at) VALUES ($1, $2, $3, $4)`;
    await this.pool.query(sql, [id, JSON.stringify(docWithId), docWithId.created_at, docWithId.updated_at]);
    return { insertedId: id };
  }

  async updateOne(filter, update) {
    const before = await this.findOne(filter);
    if (!before) return { matchedCount: 0, modifiedCount: 0 };
    const updatedDoc = applyUpdate(before, update);
    const sql = `UPDATE ${quoteIdent(this.table)} SET data = $2, updated_at = $3 WHERE id = $1`;
    await this.pool.query(sql, [before._id, JSON.stringify(updatedDoc), updatedDoc.updated_at]);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const before = await this.findOne(filter);
    if (!before) {
      if (options.upsert) {
        // Create a new document using update payload
        const docToInsert = applyUpdate({}, update, true);
        const id = uuidv4();
        const now = docToInsert.created_at || new Date();
        const docWithId = { ...docToInsert, _id: id, created_at: now, updated_at: docToInsert.updated_at || now };
        const sql = `INSERT INTO ${quoteIdent(this.table)} (id, data, created_at, updated_at) VALUES ($1, $2, $3, $4)`;
        await this.pool.query(sql, [id, JSON.stringify(docWithId), docWithId.created_at, docWithId.updated_at]);
        return options.returnDocument === 'before' ? null : docWithId;
      }
      return null;
    }
    const updatedDoc = applyUpdate(before, update, false);
    const sql = `UPDATE ${quoteIdent(this.table)} SET data = $2, updated_at = $3 WHERE id = $1`;
    await this.pool.query(sql, [before._id, JSON.stringify(updatedDoc), updatedDoc.updated_at]);
    return options.returnDocument === 'before' ? before : updatedDoc;
  }

  async deleteOne(filter) {
    const before = await this.findOne(filter);
    if (!before) return { deletedCount: 0 };
    const sql = `DELETE FROM ${quoteIdent(this.table)} WHERE id = $1`;
    await this.pool.query(sql, [before._id]);
    return { deletedCount: 1 };
  }

  async deleteMany(filter = {}) {
    const { where, params } = buildWhere(filter);
    if (!where) {
      // Safety: require a filter to avoid nuking table unintentionally
      return { deletedCount: 0 };
    }
    const sql = `DELETE FROM ${quoteIdent(this.table)} WHERE ${where}`;
    const res = await this.pool.query(sql, params);
    return { deletedCount: res.rowCount || 0 };
  }

  find(filter = {}) {
    return new PgFindCursor(this.pool, this.table, filter);
  }
}

class PgFindCursor {
  constructor(pool, table, filter) {
    this.pool = pool;
    this.table = table;
    this.filter = filter;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._project = null;
  }

  sort(sortObj) { this._sort = sortObj; return this; }
  skip(n) { this._skip = Number(n) || 0; return this; }
  limit(n) { this._limit = Number(n) || null; return this; }
  project(projObj) { this._project = projObj; return this; }

  async toArray() {
    const { where, params } = buildWhere(this.filter);
    let sql = `SELECT id, data, created_at, updated_at FROM ${quoteIdent(this.table)}`;
    if (where) sql += ` WHERE ${where}`;
    if (this._sort) {
      const sortClause = buildSort(this._sort);
      if (sortClause) sql += ` ORDER BY ${sortClause}`;
    }
    if (this._limit !== null) sql += ` LIMIT ${this._limit}`;
    if (this._skip) sql += ` OFFSET ${this._skip}`;
    const res = await this.pool.query(sql, params);
    const docs = res.rows.map(row => {
      const data = row.data || {};
      const doc = { ...data };
      if (!doc._id) doc._id = row.id;
      if (!doc.created_at) doc.created_at = row.created_at;
      if (!doc.updated_at) doc.updated_at = row.updated_at;
      return doc;
    });
    if (this._project && typeof this._project === 'object') {
      const proj = this._project;
      const hasInclude = Object.values(proj).some(v => v === 1);
      if (hasInclude) {
        const includeKeys = Object.entries(proj).filter(([,v]) => v === 1).map(([k]) => k);
        return docs.map(doc => Object.fromEntries(Object.entries(doc).filter(([k]) => includeKeys.includes(k))));
      } else {
        return docs.map(doc => {
          const copy = { ...doc };
          for (const [k, v] of Object.entries(proj)) {
            if (v === 0) delete copy[k];
          }
          return copy;
        });
      }
    }
    return docs;
  }
}

module.exports = { PgAdapter };