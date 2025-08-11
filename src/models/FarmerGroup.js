import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class FarmerGroupModel {
  static async create(groupData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Add timestamps
    const groupWithTimestamps = {
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(groupWithTimestamps);
    return { ...groupWithTimestamps, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByName(name) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    return await collection.findOne({ nama: name });
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    return await collection.find({}).toArray();
  }

  static async findByMember(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await collection.find({ "anggota.userId": objectId }).toArray();
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
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

  static async addMember(groupId, memberData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof groupId === 'string' ? new ObjectId(groupId) : groupId;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $push: { 
          anggota: memberData 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async removeMember(groupId, userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Convert string ids to ObjectId if needed
    const groupObjectId = typeof groupId === 'string' ? new ObjectId(groupId) : groupId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.updateOne(
      { _id: groupObjectId },
      { 
        $pull: { 
          anggota: { userId: userObjectId } 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async searchByName(searchTerm) {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    const query = {
      nama: { $regex: searchTerm, $options: 'i' }
    };
    
    return await collection.find(query).toArray();
  }

  static async getStatistics() {
    const { db } = await connectToDatabase();
    const collection = db.collection('farmer_groups');
    
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalGroups: { $sum: 1 },
          totalMembers: { $sum: { $size: "$anggota" } }
        }
      }
    ]).toArray();
    
    return stats.length > 0 ? stats[0] : { totalGroups: 0, totalMembers: 0 };
  }
}