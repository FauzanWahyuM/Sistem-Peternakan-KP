import { MongoClient } from "mongodb";

let client;
let clientPromise;

// Only initialize MongoDB connection if we're not in build time
if (typeof window === "undefined") {
  // Check if environment variables are available
  if (!process.env.MONGODB_URI) {
    // Don't throw error during build time, just log a warning
    if (process.env.NODE_ENV !== "production") {
      console.warn("MONGODB_URI not found in environment variables");
    }
  } else {
    const uri = process.env.MONGODB_URI;
    const options = {};

    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  }
}

// Export the clientPromise as the default export
export default clientPromise;

// Also export a named export for consistency
export { clientPromise };