import { connectToDatabase } from './mongodb';

export async function initializeDatabase() {
  const { db } = await connectToDatabase();
  
  // Create indexes for better query performance
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Livestock collection indexes
    await db.collection('livestock').createIndex({ userId: 1 });
    await db.collection('livestock').createIndex({ jenisHewan: 1 });
    await db.collection('livestock').createIndex({ kondisiKesehatan: 1 });
    
    // Training Programs collection indexes
    await db.collection('training_programs').createIndex({ userId: 1 });
    await db.collection('training_programs').createIndex({ tanggal: 1 });
    
    // Articles collection indexes
    await db.collection('articles').createIndex({ userId: 1 });
    await db.collection('articles').createIndex({ status: 1 });
    await db.collection('articles').createIndex({ kategori: 1 });
    
    // Questionnaires collection indexes
    await db.collection('questionnaires').createIndex({ userId: 1 });
    
    // Questionnaire Responses collection indexes
    await db.collection('questionnaire_responses').createIndex({ questionnaireId: 1 });
    await db.collection('questionnaire_responses').createIndex({ userId: 1 });
    
    // Farmer Groups collection indexes
    await db.collection('farmer_groups').createIndex({ nama: 1 });
    
    // Training Participation collection indexes
    await db.collection('training_participations').createIndex({ trainingId: 1 });
    await db.collection('training_participations').createIndex({ userId: 1 });
    await db.collection('training_participations').createIndex({ status: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
}

export async function createDefaultAdminUser() {
  const { db } = await connectToDatabase();
  
  // Check if admin user already exists
  const adminUser = await db.collection('users').findOne({ username: 'admin' });
  
  if (!adminUser) {
    // Create default admin user
    const defaultAdmin = {
      name: 'Administrator',
      username: 'admin',
      email: 'admin@simantek.com',
      password: '$2b$10$example_hashed_password', // This should be properly hashed
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(defaultAdmin);
    console.log('Default admin user created');
  } else {
    console.log('Admin user already exists');
  }
}