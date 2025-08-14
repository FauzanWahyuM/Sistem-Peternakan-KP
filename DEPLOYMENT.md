# Deployment Guide for Sistem Peternakan

This guide explains how to deploy the Sistem Peternakan application to Vercel with MongoDB Atlas.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A MongoDB Atlas account (https://cloud.mongodb.com)

## Setting up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com and sign up for a free account
   - Create a new project named "simantek" or similar

2. **Create a Database Cluster**
   - In your project, create a new cluster
   - Select the free tier (M0 Sandbox) for development/testing
   - Choose a cloud provider and region near your users

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Create a new database user with read and write permissions
   - Remember the username and password as you'll need them later

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Add your current IP address or allow access from anywhere (0.0.0.0/0) for development
   - For production, it's recommended to restrict access to specific IPs

5. **Get Your Connection String**
   - Go to "Database" → "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string and replace `<username>` and `<password>` with your database user credentials
   - Example: `mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/simantek`

## Deploying to Vercel

1. **Push Your Code to GitHub**
   - Create a GitHub repository for your project
   - Push your local code to the repository

2. **Import Project to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following environment variables:
   
   ```
   MONGODB_URI=mongodb+srv://syahrulzaki0706:0kaBFLryZ2PmsE8d@cluster0.gxaeql8.mongodb.net/simantek
   MONGODB_DB=simantek
   NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
   ```
   
   Note: The NEXT_PUBLIC_API_URL should NOT include `/api` at the end. It should be just the base URL of your Vercel deployment.
   
   For the specific MongoDB connection string provided by the user, use:
   ```
   MONGODB_URI=mongodb+srv://syahrulzaki0706:0kaBFLryZ2PmsE8d@cluster0.gxaeql8.mongodb.net/simantek
   ```

4. **Deploy**
   - Vercel will automatically deploy your application
   - The first deployment may take a few minutes

## Troubleshooting

### Authentication Issues

If you're having issues with login/registration:

1. **Check Environment Variables**
   - Ensure `MONGODB_URI` and `MONGODB_DB` are correctly set in Vercel
   - Verify the MongoDB connection string is correct

2. **Check MongoDB Atlas Configuration**
   - Ensure your database user has read/write permissions
   - Verify network access is configured correctly
   - Check that the IP whitelist includes Vercel's IP addresses

3. **Check API Routes**
   - Verify that your API routes are working correctly
   - Check the Vercel function logs for any errors

### Common Issues and Solutions

1. **"Failed to connect to database"**
   - Check that `MONGODB_URI` is set correctly in Vercel environment variables
   - Verify the MongoDB Atlas connection string
   - Ensure the database user credentials are correct

2. **"Invalid credentials" during login**
   - Check that users exist in the database
   - Verify that passwords are properly hashed
   - Check the Vercel function logs for any authentication errors

3. **API routes returning 500 errors**
   - Check the Vercel function logs for detailed error messages
   - Verify that all required environment variables are set
   - Ensure the MongoDB connection is working properly

## Testing the Deployment

1. **Test Registration**
   - Visit your deployed application's registration page
   - Try to create a new user account
   - Check the Vercel function logs for any errors

2. **Test Login**
   - Try to log in with the newly created account
   - Verify that you're redirected to the correct dashboard

3. **Check Database**
   - In MongoDB Atlas, verify that user data is being stored correctly
   - Check that passwords are properly hashed

## Additional Resources

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs