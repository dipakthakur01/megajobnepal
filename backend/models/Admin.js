const { getDB } = require('../config/db');
const bcrypt = require('bcrypt');

class Admin {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'admin';
    this.permissions = data.permissions || ['read', 'write', 'delete'];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async getCollection() {
    const db = getDB();
    return { collection: db.collection('admins') };
  }

  async save() {
    const { collection } = await Admin.getCollection();
    try {
      // Hash password before saving
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      
      const result = await collection.insertOne(this);
      this._id = result.insertedId;
      return this;
    } finally {
      // no-op
    }
  }

  static async findByEmail(email) {
    const { collection } = await Admin.getCollection();
    try {
      return await collection.findOne({ email });
    } finally {}
  }

  static async findByUsername(username) {
    const { collection } = await Admin.getCollection();
    try {
      return await collection.findOne({ username });
    } finally {}
  }

  static async findById(id) {
    const { collection } = await Admin.getCollection();
    try {
      return await collection.findOne({ _id: id });
    } finally {}
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(id) {
    const { collection } = await Admin.getCollection();
    try {
      await collection.updateOne(
        { _id: id },
        { $set: { lastLogin: new Date(), updatedAt: new Date() } }
      );
    } finally {}
  }

  static async findAll(options = {}) {
    const { collection } = await Admin.getCollection();
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const admins = await collection
        .find({})
        .project({ password: 0 }) // Exclude password from results
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();
      
      return admins;
    } finally {}
  }

  static async updateById(id, updateData) {
    const { collection } = await Admin.getCollection();
    try {
      
      // Hash password if it's being updated
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      updateData.updatedAt = new Date();
      const result = await collection.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      if (result && result.password) {
        delete result.password;
      }
      return result;
    } finally {}
  }
}

module.exports = Admin;