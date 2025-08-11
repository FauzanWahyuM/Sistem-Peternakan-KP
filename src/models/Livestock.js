import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class LivestockModel {
  static async create(livestockData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
    // Add timestamps
    const livestockWithTimestamps = {
      ...livestockData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(livestockWithTimestamps);
    return { ...livestockWithTimestamps, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    return await collection.find({ userId }).toArray();
  }

  static async findByFilters(filters) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
    // Build query based on filters
    const query = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.jenisHewan) {
      query.jenisHewan = filters.jenisHewan;
    }
    
    if (filters.jenisKelamin) {
      query.jenisKelamin = filters.jenisKelamin;
    }
    
    if (filters.statusTernak) {
      query.statusTernak = filters.statusTernak;
    }
    
    if (filters.kondisiKesehatan) {
      query.kondisiKesehatan = filters.kondisiKesehatan;
    }
    
    if (filters.umurTernak) {
      // For umurTernak, we'll do a text search
      query.umurTernak = { $regex: filters.umurTernak, $options: 'i' };
    }
    
    return await collection.find(query).toArray();
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
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
    const collection = db.collection('livestock');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    return await collection.find({}).toArray();
  }

  static async getStatistics(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('livestock');
    
    const matchQuery = userId ? { userId } : {};
    
    // First, get the count of each jenisHewan
    const jenisHewanStats = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$jenisHewan",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    // Then, get health condition stats for each jenisHewan
    const healthStats = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            jenisHewan: "$jenisHewan",
            kondisiKesehatan: "$kondisiKesehatan"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.jenisHewan",
          sehat: {
            $sum: {
              $cond: [{ $eq: ["$_id.kondisiKesehatan", "Sehat"] }, "$count", 0]
            }
          },
          sakit: {
            $sum: {
              $cond: [{ $eq: ["$_id.kondisiKesehatan", "Sakit"] }, "$count", 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    // Combine the results
    const result = jenisHewanStats.map(stat => {
      const healthStat = healthStats.find(hs => hs._id === stat._id);
      return {
        _id: stat._id,
        total: stat.count,
        sehat: healthStat ? healthStat.sehat : 0,
        sakit: healthStat ? healthStat.sakit : 0
      };
    });
    
    return result;
  }
}