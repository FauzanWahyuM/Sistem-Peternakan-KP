# Migration Guide: From localStorage to MongoDB

## Overview
This guide explains how to migrate the existing SIMANTEK application from localStorage-based storage to MongoDB database storage.

## Prerequisites
1. MongoDB server running (local or remote)
2. Node.js and npm installed
3. Existing SIMANTEK application codebase

## Migration Steps

### 1. Install Required Dependencies
```bash
npm install mongodb bcryptjs
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/simantek
MONGODB_DB=simantek
```

### 3. Add MongoDB Connection Code
The following files have been added to handle MongoDB connections:
- `src/lib/mongodb.js` - Database connection utility
- `src/lib/db-init.js` - Database initialization and indexing
- `src/lib/auth.js` - Authentication utilities

### 4. Create Data Models
The following model files have been created:
- `src/models/User.js` - User management
- `src/models/Livestock.js` - Livestock data management
- `src/models/TrainingProgram.js` - Training program management
- `src/models/Article.js` - Article management
- `src/models/Questionnaire.js` - Questionnaire management
- `src/models/FarmerGroup.js` - Farmer group management
- `src/models/TrainingParticipation.js` - Training participation tracking

### 5. Create API Routes
The following API routes have been created:
- `src/app/api/users/route.js` - User management endpoints
- `src/app/api/livestock/route.js` - Livestock management endpoints
- `src/app/api/training-programs/route.js` - Training program endpoints
- `src/app/api/articles/route.js` - Article management endpoints
- `src/app/api/migrate/route.js` - Data migration endpoint

### 6. Update Frontend Components
The existing frontend components have been updated to use MongoDB instead of localStorage:
- `src/app/peternak/ternak/tambah/page.tsx` - Livestock creation form
- `src/app/peternak/ternak/lihat/page.tsx` - Livestock listing and filtering
- `src/app/peternak/ternak/edit/page.tsx` - Livestock editing
- `src/app/dashboard/penyuluh/pelatihan/page.tsx` - Training program listing
- `src/app/dashboard/penyuluh/pelatihan/tambah/page.tsx` - Training program creation
- `src/app/dashboard/penyuluh/pelatihan/edit/[id]/page.tsx` - Training program editing

### 7. Data Migration
To migrate existing data from localStorage to MongoDB:

#### Option 1: Automated Migration (Recommended)
Use the built-in migration API:
1. Start your application
2. Navigate to `/api/migrate` in your browser
3. The system will automatically migrate all existing data

#### Option 2: Manual Migration Script
Run the migration script directly:
```bash
node src/lib/migrate-localstorage.js
```

### 8. Testing the Migration
After migration, verify that:
1. All existing data is accessible through the MongoDB-based UI
2. New data is being stored in MongoDB
3. Filtering and search functionality works correctly
4. Edit and delete operations work as expected

## Code Changes Summary

### Before (localStorage)
```javascript
// Saving data
localStorage.setItem('ternakList', JSON.stringify(ternakList));

// Loading data
const savedData = localStorage.getItem('ternakList');
const ternakList = savedData ? JSON.parse(savedData) : [];

// Updating data
const updatedList = ternakList.map(ternak => {
    if (ternak.id === ternakId) {
        return { ...ternak, ...updates };
    }
    return ternak;
});
localStorage.setItem('ternakList', JSON.stringify(updatedList));
```

### After (MongoDB)
```javascript
// Saving data
const response = await fetch('/api/livestock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTernak),
});

// Loading data
const response = await fetch(`/api/livestock?userId=${userId}`);
const result = await response.json();
setTernakList(result.livestock);

// Updating data
const response = await fetch(`/api/livestock/${ternakId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
});
```

## Database Schema Changes

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  username: String,
  email: String,
  password: String, // Hashed
  role: String, // "admin", "penyuluh", "peternak"
  kelompok: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Livestock Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  jenisHewan: String,
  jenisKelamin: String,
  umurTernak: String,
  statusTernak: String,
  kondisiKesehatan: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Training Programs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User (penyuluh)
  judul: String,
  deskripsi: String,
  gambar: String,
  tanggal: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues
1. **Connection refused**: Ensure MongoDB is running and the connection string is correct
2. **Data not migrating**: Check that localStorage data exists before running migration
3. **API errors**: Verify that all required environment variables are set
4. **"MongoClient is not a constructor"**: Remove deprecated options from MongoDB connection

### Debugging Steps
1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Verify MongoDB is accessible with a MongoDB client
4. Check that all required dependencies are installed

### MongoDB Connection Issues
1. **Verify MongoDB is running**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl status mongod
   ```

2. **Check connection string format**:
   - Local MongoDB: `mongodb://localhost:27017/simantek`
   - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/simantek`

### Environment Variable Issues
1. Ensure `.env.local` file exists in the root directory
2. Verify the file contains the correct MongoDB connection details
3. Restart the development server after adding environment variables

## Rollback Plan
If issues occur after migration:
1. Revert frontend components to use localStorage
2. Restore MongoDB data from backup if needed
3. Contact the development team for assistance

## Future Enhancements
1. Implement proper user authentication with JWT
2. Add data validation and sanitization
3. Implement pagination for large datasets
4. Add real-time data synchronization
5. Implement backup and restore functionality