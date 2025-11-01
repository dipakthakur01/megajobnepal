const { getDB } = require('../config/db');

class Employer {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.website = data.website;
    this.description = data.description;
    this.location = data.location;
    this.industry = data.industry;
    this.size = data.size;
    this.logo = data.logo;
    this.verified = data.verified || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async getCollection() {
    const db = getDB();
    return { collection: db.collection('employers') };
  }

  async save() {
    const { collection } = await Employer.getCollection();
    try {
      const result = await collection.insertOne(this);
      this._id = result.insertedId;
      return this;
    } finally {}
  }

  static async findAll(options = {}) {
    const { collection } = await Employer.getCollection();
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const employers = await collection
        .find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();
      
      return employers;
    } finally {}
  }

  static async findById(id) {
    const { collection } = await Employer.getCollection();
    try {
      return await collection.findOne({ _id: id });
    } finally {}
  }

  static async updateById(id, updateData) {
    const { collection } = await Employer.getCollection();
    try {
      updateData.updatedAt = new Date();
      const result = await collection.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result;
    } finally {}
  }

  static async deleteById(id) {
    const { collection } = await Employer.getCollection();
    try {
      const result = await collection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } finally {}
  }

  static async count() {
    const { collection } = await Employer.getCollection();
    try {
      return await collection.countDocuments();
    } finally {}
  }
}

module.exports = Employer;