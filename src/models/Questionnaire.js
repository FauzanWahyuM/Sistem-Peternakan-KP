import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export class QuestionnaireModel {
  static async create(questionnaireData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    
    // Add timestamps
    const questionnaireWithTimestamps = {
      ...questionnaireData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(questionnaireWithTimestamps);
    return { ...questionnaireWithTimestamps, _id: result.insertedId };
  }

  static async findById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    return await collection.find({ userId }).toArray();
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    return await collection.find({}).toArray();
  }

  static async updateById(id, updateData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    
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
    const collection = db.collection('questionnaires');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  }

  static async searchByTitle(searchTerm) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaires');
    
    const query = {
      judul: { $regex: searchTerm, $options: 'i' }
    };
    
    return await collection.find(query).toArray();
  }
}

export class QuestionnaireResponseModel {
  static async create(responseData) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Add timestamp
    const responseWithTimestamp = {
      ...responseData,
      submittedAt: new Date()
    };
    
    const result = await collection.insertOne(responseWithTimestamp);
    return { ...responseWithTimestamp, _id: result.insertedId };
  }

  static async findByQuestionnaireId(questionnaireId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof questionnaireId === 'string' ? new ObjectId(questionnaireId) : questionnaireId;
    return await collection.find({ questionnaireId: objectId }).toArray();
  }

  static async findByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await collection.find({ userId: objectId }).toArray();
  }

  static async findByQuestionnaireAndUser(questionnaireId, userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string ids to ObjectId if needed
    const questionnaireObjectId = typeof questionnaireId === 'string' ? new ObjectId(questionnaireId) : questionnaireId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await collection.findOne({ 
      questionnaireId: questionnaireObjectId, 
      userId: userObjectId 
    });
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    return await collection.find({}).toArray();
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async deleteByQuestionnaireId(questionnaireId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof questionnaireId === 'string' ? new ObjectId(questionnaireId) : questionnaireId;
    
    const result = await collection.deleteMany({ questionnaireId: objectId });
    return result.deletedCount;
  }

  static async deleteByUserId(userId) {
    const { db } = await connectToDatabase();
    const collection = db.collection('questionnaire_responses');
    
    // Convert string id to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.deleteMany({ userId: objectId });
    return result.deletedCount;
  }
}