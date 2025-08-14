# Testing Authentication System

This document explains how to test the registration and login functionality of the application.

## Prerequisites

1. Ensure MongoDB is running (either locally or MongoDB Atlas)
2. Environment variables are properly configured in `.env.local`

## Running the Authentication Test

To test the authentication system, run:

```bash
npm run test-auth
```

This will:

1. Connect to the database
2. Create a test user
3. Verify password hashing and verification
4. Clean up the test user
5. Close the database connection

## Manual Testing

You can also test the authentication system manually:

1. **Registration Test**
   - Visit the registration page (`/register`)
   - Fill in the form with valid data
   - Submit the form
   - Check that the user is created in the database

2. **Login Test**
   - Visit the login page (`/login`)
   - Enter valid credentials
   - Verify that you're redirected to the correct dashboard
   - Check that a token is stored in localStorage

## Troubleshooting

If tests fail, check:

1. MongoDB connection string in `.env.local`
2. Network connectivity to MongoDB (especially for MongoDB Atlas)
3. Database user permissions
4. Environment variables are correctly set