import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class TrainingProgramModel {
  static async create(trainingData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    // Add timestamps
    const trainingWithTimestamps = {
      ...trainingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(trainingWithTimestamps);
    return { ...trainingWithTimestamps, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    return await collection.find({ userId }).toArray();
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    return await collection.find({}).toArray();
  }

  static async findByDateRange(startDate, endDate) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    const query = {
      tanggal: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    return await collection.find(query).toArray();
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
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
    const collection = db.collection('training_programs');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  }

  static async searchByTitle(searchTerm) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    const query = {
      judul: { $regex: searchTerm, $options: 'i' }
    };
    
    return await collection.find(query).toArray();
  }

  static async getStatistics(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_programs');
    
    const matchQuery = userId ? { userId } : {};
    
    const stats = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $month: "$tanggal" }, { $month: new Date() }] },
                    { $eq: [{ $year: "$tanggal" }, { $year: new Date() }] }
                  ]
                },
                1,
                0
              ]
            }
          },
          upcoming: {
            $sum: {
              $cond: [{ $gt: ["$tanggal", new Date()] }, 1, 0]
            }
          },
          past: {
            $sum: {
              $cond: [{ $lte: ["$tanggal", new Date()] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();
    
    return stats.length > 0 ? stats[0] : { total: 0, thisMonth: 0, upcoming: 0, past: 0 };
  }
}