# Migration Guide: From MongoDB to Static Implementation

## Overview
This guide explains how to migrate the existing SIMANTEK application from MongoDB database storage to static data implementation.

## Prerequisites
1. Node.js and npm installed
2. Existing SIMANTEK application codebase

## Migration Steps

### 1. Remove MongoDB Dependencies
The following MongoDB-related dependencies have been removed:
- `mongodb`
- `bcryptjs` (kept for password hashing in static implementation)

### 2. Update Environment Variables
The `.env.local` file has been updated to remove MongoDB settings:
```env
# Environment configuration for static implementation
# MongoDB settings have been removed

# API URL for frontend - For development, this points to localhost (do not include /api)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Add Static Data Implementation
The following files have been added to handle static data:
- `src/lib/static-users.js` - Static user data storage
- Updated model files to use static data instead of MongoDB

### 4. Update Data Models
The following model files have been updated to use static data:
- `src/models/User.js` - User management with static data
- `src/models/Livestock.js` - Livestock data management with static data
- `src/models/TrainingProgram.js` - Training program management with static data
- `src/models/Article.js` - Article management with static data
- `src/models/Questionnaire.js` - Questionnaire management with static data
- `src/models/FarmerGroup.js` - Farmer group management with static data
- `src/models/TrainingParticipation.js` - Training participation tracking with static data

### 5. Update Authentication
The authentication system has been updated to work with static data:
- `src/lib/auth.js` - Updated authentication utilities
- `src/app/api/auth/login/route.js` - Updated login API route
- `src/app/api/auth/register/route.js` - Updated register API route

## Code Changes Summary

### Before (MongoDB)
```javascript
// Saving data
const { db } = await connectToDatabase();
const collection = db.collection('users');
const result = await collection.insertOne(userWithTimestamps);

// Loading data
const { db } = await connectToDatabase();
const collection = db.collection('users');
return await collection.findOne({ username });

// Updating data
const { db } = await connectToDatabase();
const collection = db.collection('users');
const result = await collection.updateOne(
  { _id: objectId },
  { $set: { ...updateData, updatedAt: new Date() } }
);
```

### After (Static Data)
```javascript
// Saving data
staticUsers.push(newUser);
return newUser;

// Loading data
return staticUsers.find(user => user.username === username);

// Updating data
staticUsers[index] = {
  ...staticUsers[index],
  ...updateData,
  updatedAt: new Date()
};
```

## Static Data Structure

### Users Data
```javascript
const staticUsers = [
  {
    id: '1',
    nama: 'Admin User',
    username: 'admin',
    email: 'admin@simantek.com',
    password: '$2b$10$example_hashed_password',
    kelompok: 'Administrator',
    role: 'admin',
    status: 'Aktif',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  // Additional predefined users...
];
```

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

## Testing the Migration

After migration, verify that:
1. All predefined users can log in successfully
2. New user registration works (data not persisted between restarts)
3. All API routes return valid responses
4. Frontend components work correctly with static data

## Troubleshooting

### Common Issues
1. **Login fails**: Ensure you're using the correct predefined usernames and passwords
2. **Registration data lost**: This is expected behavior for static implementation
3. **API errors**: Check that all model files have been properly updated

### Debugging Steps
1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Verify that static data files exist and are correctly formatted
4. Ensure all API routes are working correctly

## Rollback Plan

If issues occur after migration:
1. Restore the MongoDB implementation files
2. Reinstall MongoDB dependencies
3. Restore environment variables for MongoDB
4. Contact the development team for assistance

## Future Enhancements

1. Implement data persistence for static implementation
2. Add more predefined data for testing
3. Implement backup and restore functionality for static data
4. Add data validation and sanitization for static implementation