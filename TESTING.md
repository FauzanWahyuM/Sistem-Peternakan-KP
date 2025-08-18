# Testing Authentication System

This document explains how to test the registration and login functionality of the application.

## Prerequisites

1. No database setup required - the application uses static data
2. Environment variables are properly configured in `.env.local`

## Running the Authentication Test

To test the authentication system, run:

```bash
npm run test-auth
```

This will:

1. Test user retrieval from static data
2. Verify password hashing and verification
3. Test user creation functionality

## Manual Testing

You can also test the authentication system manually:

1. **Registration Test**
   - Visit the registration page (`/register`)
   - Fill in the form with valid data
   - Submit the form
   - Check that the user is created in memory (note: data is not persisted)

2. **Login Test**
   - Visit the login page (`/login`)
   - Enter valid credentials
   - Verify that you're redirected to the correct dashboard
   - Check that a token is stored in localStorage

## Predefined Users

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

## Troubleshooting

If tests fail, check:

1. Environment variables are correctly set
2. Node.js is properly installed
3. All dependencies are installed (`npm install`)