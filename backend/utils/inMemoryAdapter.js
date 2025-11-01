const { v4: uuidv4 } = require('uuid');

class InMemoryAdapter {
  constructor() {
    this._collections = new Map();
  }

  collection(name) {
    if (!this._collections.has(name)) {
      this._collections.set(name, new Map());
    }
    return new InMemoryCollection(this._collections.get(name));
  }

  admin() {
    return {
      ping: async () => {
        return; // always ok in memory
      }
    };
  }
}

class InMemoryCollection {
  constructor(store) {
    this.store = store; // Map(id -> doc)
  }

  _match(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    // basic equality and _id/id matching; enough for auth and CRUD in this project
    for (const [key, value] of Object.entries(filter)) {
      if (key === '_id' || key === 'id') {
        const idVal = typeof value === 'string' ? value : value?.toString?.() || String(value);
        if ((doc._id || doc.id) !== idVal) return false;
        continue;
      }
      if (key === '$or' && Array.isArray(value)) {
        const anyMatch = value.some(sub => this._match(doc, sub));
        if (!anyMatch) return false;
        continue;
      }
      // support operator objects like {$in: [...]} used by listings
      if (value && typeof value === 'object' && Array.isArray(value.$in)) {
        const v = doc[key];
        const arr = value.$in.map(val => String(val));
        const vStr = v === undefined || v === null ? undefined : String(v);
        if (!arr.includes(vStr)) return false;
        continue;
      }
      const v = doc[key];
      if (value instanceof RegExp) {
        const pattern = value.source.toLowerCase();
        if (String(v || '').toLowerCase().indexOf(pattern) === -1) return false;
      } else {
        if (v === undefined || String(v) !== String(value)) return false;
      }
    }
    return true;
  }

  async findOne(filter, options = {}) {
    for (const doc of this.store.values()) {
      if (this._match(doc, filter)) {
        const out = { ...doc };
        if (options && options.projection && typeof options.projection === 'object') {
          const proj = options.projection;
          const hasInclude = Object.values(proj).some(v => v === 1);
          if (hasInclude) {
            const includeKeys = Object.entries(proj).filter(([,v]) => v === 1).map(([k]) => k);
            return Object.fromEntries(Object.entries(out).filter(([k]) => includeKeys.includes(k)));
          } else {
            for (const [k, v] of Object.entries(proj)) {
              if (v === 0) delete out[k];
            }
          }
        }
        return out;
      }
    }
    return null;
  }

  async countDocuments(filter = {}) {
    let count = 0;
    for (const doc of this.store.values()) {
      if (this._match(doc, filter)) count++;
    }
    return count;
  }

  async insertOne(doc) {
    const id = uuidv4();
    const now = new Date();
    const docWithId = { ...doc, _id: id, created_at: doc.created_at || now, updated_at: doc.updated_at || now };
    this.store.set(id, docWithId);
    return { insertedId: id };
  }

  async updateOne(filter, update) {
    const before = await this.findOne(filter);
    if (!before) return { matchedCount: 0, modifiedCount: 0 };
    const out = { ...before };
    if (update && typeof update === 'object') {
      if (update.$set && typeof update.$set === 'object') {
        for (const [k, v] of Object.entries(update.$set)) out[k] = v;
      }
      if (update.$unset && typeof update.$unset === 'object') {
        for (const k of Object.keys(update.$unset)) delete out[k];
      }
    }
    out.updated_at = new Date();
    this.store.set(before._id, out);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async updateMany(filter = {}, update) {
    let matched = 0;
    let modified = 0;
    for (const [id, doc] of this.store.entries()) {
      if (this._match(doc, filter)) {
        matched++;
        const out = { ...doc };
        if (update && typeof update === 'object') {
          if (update.$set && typeof update.$set === 'object') {
            for (const [k, v] of Object.entries(update.$set)) out[k] = v;
          }
          if (update.$unset && typeof update.$unset === 'object') {
            for (const k of Object.keys(update.$unset)) delete out[k];
          }
        }
        out.updated_at = new Date();
        this.store.set(id, out);
        modified++;
      }
    }
    return { matchedCount: matched, modifiedCount: modified };
  }
  find(filter = {}) {
    return new InMemoryFindCursor(this.store, filter);
  }

  async deleteMany(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return { deletedCount: 0 };
    let deleted = 0;
    for (const [id, doc] of this.store.entries()) {
      if (this._match(doc, filter)) {
        this.store.delete(id);
        deleted++;
      }
    }
    return { deletedCount: deleted };
  }
}

class InMemoryFindCursor {
  constructor(store, filter) {
    this.store = store;
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
    let docs = [];
    for (const doc of this.store.values()) {
      if (this._match(doc, this.filter)) docs.push({ ...doc });
    }
    // basic sort on top-level fields
    if (this._sort && typeof this._sort === 'object') {
      const entries = Object.entries(this._sort);
      if (entries.length) {
        const [key, dir] = entries[0];
        docs.sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av === bv) return 0;
          const cmp = av > bv ? 1 : -1;
          return dir < 0 ? -cmp : cmp;
        });
      }
    }
    if (this._skip) docs = docs.slice(this._skip);
    if (this._limit !== null) docs = docs.slice(0, this._limit);

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

module.exports = { InMemoryAdapter };