import { connectToDatabase } from './mongodb';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    const { client, db } = await connectToDatabase();
    console.log('Connected successfully to MongoDB');
    
    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close the connection
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

testConnection();