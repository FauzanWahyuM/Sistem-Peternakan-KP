import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'simantek';

// Global variables to maintain connection across hot reloads in development
// In production (Vercel), we don't cache connections as strictly
global.mongo = global.mongo || {};

export async function connectToDatabase() {
  // For Vercel deployment, we need to ensure the connection string is properly configured
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  try {
    // In development, use cached connection
    if (process.env.NODE_ENV === 'development') {
      if (global.mongo.client && global.mongo.db) {
        return { client: global.mongo.client, db: global.mongo.db };
      }
      
      const client = await MongoClient.connect(MONGODB_URI, {
        // Additional options for better connection handling
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      const db = client.db(MONGODB_DB);
      
      // Cache the connection for reuse in development
      global.mongo.client = client;
      global.mongo.db = db;
      
      return { client, db };
    } else {
      // In production (Vercel), create a new connection each time
      // but reuse within the same request context
      const client = await MongoClient.connect(MONGODB_URI, {
        // Serverless-friendly options
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      const db = client.db(MONGODB_DB);
      
      return { client, db };
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

export async function disconnectFromDatabase() {
  // Only disconnect in development if we have a cached connection
  if (process.env.NODE_ENV === 'development' && global.mongo.client) {
    await global.mongo.client.close();
    global.mongo.client = null;
    global.mongo.db = null;
  }
}