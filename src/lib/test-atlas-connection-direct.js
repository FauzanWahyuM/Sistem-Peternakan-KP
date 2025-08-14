// Simple test script that directly tests the Atlas connection without relying on environment variables
const { MongoClient } = require('mongodb');

// Use the Atlas connection string directly
const uri = "mongodb+srv://syahrulzaki0706:0kaBFLryZ2PmsE8d@cluster0.gxaeql8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "simantek";

async function testAtlasConnection() {
  let client;
  
  try {
    console.log("Testing MongoDB Atlas connection directly...");
    
    // Create a new MongoClient
    client = new MongoClient(uri);
    
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    
    // Access the database
    const db = client.db(dbName);
    
    // List collections in the database
    const collections = await db.listCollections().toArray();
    console.log("Available collections in database '" + dbName + "':");
    if (collections.length === 0) {
      console.log("- No collections found");
    } else {
      collections.forEach(collection => {
        console.log("- " + collection.name);
      });
    }
    
    console.log("Atlas connection test completed successfully!");
  } catch (error) {
    console.error("Atlas connection test failed:", error.message);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAtlasConnection();
}