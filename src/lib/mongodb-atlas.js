const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Atlas connection URI from environment variables
const uri = process.env.MONGODB_ATLAS_URI || "mongodb+srv://syahrulzaki0706:0kaBFLryZ2PmsE8d@cluster0.gxaeql8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToAtlas() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error);
    throw error;
  }
}

async function closeConnection() {
  try {
    await client.close();
    console.log("MongoDB Atlas connection closed.");
  } catch (error) {
    console.error("Error closing MongoDB Atlas connection:", error);
  }
}

// Export functions for use in other files
module.exports = { connectToAtlas, closeConnection };