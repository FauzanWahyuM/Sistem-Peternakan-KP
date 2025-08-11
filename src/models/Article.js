import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class ArticleModel {
  static async create(articleData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    // Add timestamps
    const articleWithTimestamps = {
      ...articleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(articleWithTimestamps);
    return { ...articleWithTimestamps, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    return await collection.find({ userId }).toArray();
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    return await collection.find({}).toArray();
  }

  static async findByStatus(status) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    return await collection.find({ status }).toArray();
  }

  static async findByCategory(category) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    return await collection.find({ kategori: category }).toArray();
  }

  static async searchByTitle(searchTerm) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    const query = {
      judul: { $regex: searchTerm, $options: 'i' }
    };
    
    return await collection.find(query).toArray();
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  }

  static async getLatest(limit = 3) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    return await collection.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async getStatistics(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    
    const matchQuery = userId ? { userId } : {};
    
    const stats = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const result = { published: 0, draft: 0 };
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });
    
    return result;
  }
}