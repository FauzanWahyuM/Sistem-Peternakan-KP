# Troubleshooting "Failed to Fetch" Error in Authentication

## Problem Description

When trying to register a new user on the deployed Vercel application, you receive a "failed to fetch" error. This indicates that the frontend cannot establish a connection to the backend API routes.

## Common Causes and Solutions

### 1. Incorrect NEXT_PUBLIC_API_URL Environment Variable

**Issue**: The `NEXT_PUBLIC_API_URL` environment variable is not set correctly in Vercel.

**Solution**:
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Ensure `NEXT_PUBLIC_API_URL` is set to your Vercel deployment URL WITHOUT the `/api` suffix
   - Correct: `https://your-app.vercel.app`
   - Incorrect: `https://your-app.vercel.app/api`

4. After setting the environment variable, trigger a new deployment:
   - Go to the "Deployments" tab
   - Click the "Redeploy" button for the latest deployment
   - Or make a small change and push to your repository to trigger a new deployment

### 2. CORS (Cross-Origin Resource Sharing) Issues

**Issue**: The browser blocks requests due to CORS policy violations.

**Solution**:
We've added CORS handling to all API routes through middleware. This should resolve most CORS issues. However, if you're still experiencing problems:

1. Ensure your frontend and API routes are on the same domain
2. Check that you're not using different ports or subdomains
3. Verify that the middleware is working correctly by checking the response headers in your browser's developer tools

### 2. MongoDB Connection Issues

**Issue**: The application cannot connect to the MongoDB database.

**Solution**:
1. Verify that `MONGODB_URI` is correctly set in Vercel environment variables
2. Ensure the MongoDB Atlas connection string is correct:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`
   - Replace `username`, `password`, `cluster`, and `database_name` with your actual values
3. Check that your MongoDB Atlas IP whitelist includes Vercel's IP addresses or is set to "Allow access from anywhere" (0.0.0.0/0) for testing

### 3. CORS (Cross-Origin Resource Sharing) Issues

**Issue**: The browser blocks requests due to CORS policy violations.

**Solution**:
In Next.js API routes, CORS is typically not an issue when frontend and API routes are on the same domain. However, if you're experiencing CORS issues:

1. Ensure your frontend and API routes are on the same domain
2. Check that you're not using different ports or subdomains

### 4. Network Connectivity Issues

**Issue**: Vercel functions cannot connect to external services.

**Solution**:
1. Check Vercel's status page for any ongoing issues: https://www.vercel-status.com/
2. Verify that your MongoDB Atlas cluster is running and accessible
3. Check your firewall settings to ensure they're not blocking connections

## Step-by-Step Troubleshooting Guide

### Step 1: Verify Environment Variables

1. Log in to your Vercel account
2. Go to your project dashboard
3. Click on "Settings" → "Environment Variables"
4. Check that you have these variables set:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `MONGODB_DB`: Your database name (e.g., `simantek`)
   - `NEXT_PUBLIC_API_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### Step 2: Check Vercel Deployment Logs

1. Go to your Vercel project dashboard
2. Click on the latest deployment
3. Check the build logs for any errors
4. Look for database connection errors or environment variable issues

### Step 3: Test API Routes Directly

1. Open your browser and navigate to your API route directly:
   - `https://your-app.vercel.app/api/test-api`
2. If this returns an error, there's likely a backend issue
3. Check the Vercel function logs for detailed error messages

### Step 4: Check Browser Developer Tools

1. Open your browser's developer tools (F12)
2. Go to the "Network" tab
3. Try to register a new user
4. Look for failed requests and check their details:
   - Status code
   - Error message
   - Request URL

### Step 5: Verify MongoDB Atlas Configuration

1. Log in to MongoDB Atlas
2. Check that your cluster is running
3. Verify database user credentials
4. Check IP whitelist settings:
   - For testing: Add `0.0.0.0/0` to allow all IPs
   - For production: Add Vercel's IP addresses

## Testing Your Fix

After implementing the above solutions:

1. Trigger a new deployment in Vercel
2. Wait for the deployment to complete
3. Try to register a new user
4. Check the browser console for any remaining errors

## Additional Debugging Tips

### Enable Detailed Logging

Add more console.log statements to your API routes to help identify where the issue occurs:

```javascript
// In your API route files
console.log('API route called');
console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});
```

### Test Database Connection Separately

Create a simple test API route to verify database connectivity:

```javascript
// src/app/api/test-db/route.js
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database successfully');
    
    // Test query
    const users = await db.collection('users').find({}).limit(1).toArray();
    console.log('Database query successful');
    
    return new Response(JSON.stringify({ message: 'Database connection successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## Need More Help?

If you're still experiencing issues:

1. Check Vercel's documentation: https://vercel.com/docs
2. Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
3. Review the deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)
4. Contact Vercel support if you suspect an issue with their platform