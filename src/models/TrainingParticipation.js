import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class TrainingParticipationModel {
  static async create(participationData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Add timestamp
    const participationWithTimestamp = {
      ...participationData,
      registrationDate: new Date()
    };
    
    const result = await collection.insertOne(participationWithTimestamp);
    return { ...participationWithTimestamp, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByTrainingId(trainingId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof trainingId === 'string' ? new ObjectId(trainingId) : trainingId;
    return await collection.find({ trainingId: objectId }).toArray();
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await collection.find({ userId: objectId }).toArray();
  }

  static async findByTrainingAndUser(trainingId, userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string ids to ObjectId if needed
    const trainingObjectId = typeof trainingId === 'string' ? new ObjectId(trainingId) : trainingId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await collection.findOne({ trainingId: trainingObjectId, userId: userObjectId });
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    return await collection.find({}).toArray();
  }

  static async updateStatus(id, status) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updateData = { status };
    if (status === 'completed') {
      updateData.completionDate = new Date();
    }
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByTrainingId(trainingId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof trainingId === 'string' ? new ObjectId(trainingId) : trainingId;
    
    const result = await collection.deleteMany({ trainingId: objectId });
    return result.deletedCount;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.deleteMany({ userId: objectId });
    return result.deletedCount;
  }

  static async getStatistics(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('training_participations');
    
    // Convert string id to ObjectId if needed
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const matchQuery = userId ? { userId: userObjectId } : {};
    
    const stats = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const result = { registered: 0, completed: 0, cancelled: 0 };
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });
    
    return result;
  }
}