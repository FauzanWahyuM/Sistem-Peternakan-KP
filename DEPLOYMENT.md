# Deployment Guide for Sistem Peternakan

This guide explains how to deploy the Sistem Peternakan application to Vercel with static data implementation.

## Prerequisites

1. A Vercel account (https://vercel.com)

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
   - Add the following environment variable:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
   ```
   
   Note: The NEXT_PUBLIC_API_URL should NOT include `/api` at the end. It should be just the base URL of your Vercel deployment.

4. **Deploy**
   - Vercel will automatically deploy your application
   - The first deployment may take a few minutes

## Static Data Implementation

This version of the application uses static data instead of MongoDB. All data is stored in memory and will be reset when the server restarts.

### Predefined Users

The application comes with predefined users for testing:

1. **Admin User**
   - Username: admin
   - Password: password
   - Role: admin

2. **Penyuluh User**
   - Username: penyuluh
   - Password: password
   - Role: penyuluh

3. **Peternak User**
   - Username: peternak
   - Password: password
   - Role: peternak

## Testing the Deployment

1. **Test Login**
   - Visit your deployed application's login page
   - Try to log in with one of the predefined users
   - Verify that you're redirected to the correct dashboard

2. **Test Registration**
   - Visit your deployed application's registration page
   - Try to create a new user account
   - Note that registration data is not persisted between server restarts

## Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs