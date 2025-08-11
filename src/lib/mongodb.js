import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simantek';
const MONGODB_DB = process.env.MONGODB_DB || 'simantek';

// Global variables to maintain connection across hot reloads in development
global.mongo = global.mongo || {};

let cachedClient = global.mongo.client;
let cachedDb = global.mongo.db;

if (!cachedClient) {
  cachedClient = global.mongo.client = null;
  cachedDb = global.mongo.db = null;
}

export async function connectToDatabase() {
  // Use existing connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);

    // Cache the connection for reuse
    cachedClient = global.mongo.client = client;
    cachedDb = global.mongo.db = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = global.mongo.client = null;
    cachedDb = global.mongo.db = null;
  }
}