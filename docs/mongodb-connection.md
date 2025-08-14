# MongoDB Connection Implementation

This document explains the new MongoDB connection implementation using the MongoClient pattern, and how the frontend connects to the MongoDB Atlas backend.

## Files Created

1. `src/lib/mongodb-new.js` - New MongoDB connection implementation
2. `src/app/api/test-new-mongodb/route.js` - Test API route for the new connection
3. `src/app/api/users/users.js` - Users API handler (CommonJS format)

## New MongoDB Connection (`mongodb-new.js`)

The new implementation follows the standard Next.js MongoDB connection pattern:

```javascript
import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to cache the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, always create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

## Environment Configuration

Make sure your `.env.local` file contains the correct MongoDB URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
MONGODB_DB=database_name
```

For Vercel deployments, the MongoDB configuration is set in `vercel.json`:

```json
{
  "env": {
    "MONGODB_URI": "mongodb+srv://username:password@cluster.mongodb.net/database_name",
    "MONGODB_DB": "database_name"
  }
}
```

## Usage in API Routes

To use the new connection in API routes:

```javascript
import clientPromise from "../../../lib/mongodb-new";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "simantek");
    const users = await db.collection("user").find({}).toArray();
    return Response.json({ users: users });
  } catch (e) {
    return Response.json({ error: "Database error: " + e.message }, { status: 500 });
  }
}
```

## Testing

You can test the connection with:

```bash
npm run test-atlas-direct
```

Or by accessing the test API routes:
- `/api/test-new-mongodb` - Tests the new MongoDB connection implementation
- `/api/test-connection` - Tests the connection and returns database information

You can also test the API client with:
```bash
npm run test-api-client
```

## Frontend API Connection

The frontend connects to the backend API through the `ApiClient` class in `src/lib/api-client.js`. The API client automatically detects whether it's running in a Vercel deployment or local development:

1. In Vercel deployments, it uses the Vercel URL (`https://<vercel-url>`)
2. In local development, it uses a relative path by default (no absolute URL)
3. It can be overridden with the `NEXT_PUBLIC_API_URL` environment variable

This ensures that frontend requests always go to the correct backend endpoint, whether running locally or deployed to Vercel. When using relative paths, the requests will be made to the same domain as the frontend, which is the correct approach for Next.js applications.

## Vercel Deployment

When deploying to Vercel, you need to set the environment variables in the Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `MONGODB_DB` - Your MongoDB database name

The updated MongoDB connection implementation handles build time issues by:
- Checking if environment variables are available during build time
- Not throwing errors during build time when environment variables are not available
- Properly initializing connections only when running in a server environment

## Benefits of This Approach

1. **Connection Reuse**: In development, connections are reused to avoid multiple connections
2. **Environment Specific**: Different connection strategies for development and production
3. **Error Handling**: Proper error handling with meaningful error messages
4. **Type Safety**: Uses modern ES modules with proper imports
5. **Vercel Compatible**: Automatically works with Vercel deployments
6. **MongoDB Atlas**: Uses MongoDB Atlas for both local development and production
7. **Build Time Safe**: Handles Vercel build process without requiring environment variables during build time