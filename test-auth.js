/**
 * Test script for registration and login functionality
 * This script can be used to verify that the authentication system works correctly
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/simantek';
const MONGODB_DB = process.env.MONGODB_DB || 'simantek';

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

async function verifyPassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error verifying password');
  }
}

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const db = client.db(MONGODB_DB);
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

async function testAuth() {
  try {
    console.log('Testing authentication system...');
    
    // Connect to database
    console.log('Connecting to database...');
    const { client, db } = await connectToDatabase();
    console.log('Connected to database successfully');
    
    // Test user creation
    console.log('Testing user creation...');
    const testUser = {
      nama: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      kelompok: 'Test Group',
      role: 'peternak',
      status: 'Aktif'
    };
    
    // Hash password
    const hashedPassword = await hashPassword(testUser.password);
    const userWithHashedPassword = {
      ...testUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create user
    const collection = db.collection('users');
    const result = await collection.insertOne(userWithHashedPassword);
    console.log('User created successfully with ID:', result.insertedId);
    
    // Test user retrieval
    console.log('Testing user retrieval...');
    const retrievedUser = await collection.findOne({ username: testUser.username });
    console.log('User retrieved successfully:', retrievedUser.username);
    
    // Test password verification
    console.log('Testing password verification...');
    const isPasswordValid = await verifyPassword(testUser.password, retrievedUser.password);
    console.log('Password verification result:', isPasswordValid);
    
    // Test invalid password
    const isInvalidPassword = await verifyPassword('wrongpassword', retrievedUser.password);
    console.log('Invalid password verification result:', isInvalidPassword);
    
    // Clean up test user
    console.log('Cleaning up test user...');
    await collection.deleteOne({ _id: result.insertedId });
    console.log('Test user cleaned up successfully');
    
    // Close connection
    await client.close();
    console.log('Database connection closed');
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();