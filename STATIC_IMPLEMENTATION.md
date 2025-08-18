# Static Implementation Guide

This document explains how the application has been modified to use static data instead of MongoDB.

## Changes Made

1. **Static User Data**: Created `src/lib/static-users.js` with predefined user data
2. **Modified User Model**: Updated `src/models/User.js` to use static data instead of MongoDB
3. **Updated Authentication**: Modified authentication functions in `src/lib/auth.js` to work with static data
4. **API Routes**: Updated login and register API routes to use static data
5. **Removed MongoDB Dependencies**: Removed all MongoDB-related files and dependencies
6. **Environment Configuration**: Updated environment configuration to remove MongoDB settings
7. **Package.json**: Removed MongoDB dependencies from package.json

## Static Users

The application now uses the following static users:

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

## Testing

A test script `test-auth-static.js` has been created to verify the static authentication system works correctly.

## Usage

To use the application with static data:

1. Start the development server: `npm run dev`
2. Access the login page at `/login`
3. Use one of the predefined users to log in

## Adding New Users

To add new users, modify the `staticUsers` array in `src/lib/static-users.js`.

## Limitations

This static implementation has the following limitations:

1. User data is not persisted between server restarts
2. New user registrations are not permanently stored
3. Only suitable for development and testing purposes

For production use, a proper database implementation should be used.