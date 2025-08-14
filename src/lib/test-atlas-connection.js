const { connectToAtlas, closeConnection } = require('./mongodb-atlas');

async function testAtlasConnection() {
  try {
    console.log("Testing MongoDB Atlas connection...");
    const client = await connectToAtlas();
    
    // List all databases
    const databases = await client.db().admin().listDatabases();
    console.log("Databases:");
    databases.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    await closeConnection();
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAtlasConnection();
}