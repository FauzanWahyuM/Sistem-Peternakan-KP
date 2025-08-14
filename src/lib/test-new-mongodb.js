const { execSync } = require('child_process');

// We'll test by running a simple Node.js script that uses the new MongoDB connection
const testScript = `
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    console.log('Testing new MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'simantek');
    
    // Test by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log('- ' + collection.name);
    });
    
    await client.close();
    console.log('New MongoDB connection test completed successfully!');
  } catch (error) {
    console.error('New MongoDB connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
`;

// Write the test script to a temporary file and execute it
const fs = require('fs');
const path = require('path');

const tempScriptPath = path.join(__dirname, 'temp-test-mongodb.js');
fs.writeFileSync(tempScriptPath, testScript);

try {
  // Execute the test script
  execSync(`node "${tempScriptPath}"`, { stdio: 'inherit' });
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
}