import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class UserModel {
  static async create(userData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    // Add timestamps
    const userWithTimestamps = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(userWithTimestamps);
    return { ...userWithTimestamps, _id: result.insertedId };
  }

  static async findByUsername(username) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    return await collection.findOne({ username });
  }

  static async findByEmail(email) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    return await collection.findOne({ email });
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
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

  static async updateLastLogin(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          lastLogin: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    return await collection.find({}).toArray();
  }

  static async findByRole(role) {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    return await collection.find({ role }).toArray();
  }
}