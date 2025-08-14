import clientPromise from "../../../lib/mongodb-new";

export async function GET(request) {
  try {
    // Check if clientPromise is available
    if (!clientPromise) {
      return Response.json({
        success: false,
        error: "MongoDB connection not available - check environment variables"
      }, { status: 500 });
    }
    
    // Test the MongoDB connection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "simantek");
    
    // Try to list collections as a test
    const collections = await db.listCollections().toArray();
    
    // Get some basic info about the database
    const dbStats = await db.stats();
    
    return Response.json({
      success: true,
      message: "Successfully connected to MongoDB Atlas",
      database: process.env.MONGODB_DB || "simantek",
      collections: collections.map(c => c.name),
      stats: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        avgObjSize: dbStats.avgObjSize,
        dataSize: dbStats.dataSize
      }
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}