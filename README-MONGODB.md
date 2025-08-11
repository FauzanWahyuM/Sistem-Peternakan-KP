# MongoDB Integration for SIMANTEK System

## Overview
This document explains how to integrate MongoDB with the existing SIMANTEK (Sistem Informasi Penjaminan Mutu Kelompok Peternak) application. The integration replaces the localStorage-based data storage with a proper MongoDB database.

## Prerequisites
1. MongoDB installed locally or access to a MongoDB Atlas cluster
2. Node.js and npm installed
3. Environment variables configured

## Setup Instructions

### 1. Install Dependencies
```bash
npm install mongodb bcryptjs
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/simantek
MONGODB_DB=simantek
```

### 3. Database Collections
The system uses the following MongoDB collections:
- `users` - Stores user information (admin, penyuluh, peternak)
- `livestock` - Stores livestock data for peternak
- `training_programs` - Stores training program information
- `articles` - Stores articles created by admin/penyuluh
- `questionnaires` - Stores questionnaire templates
- `questionnaire_responses` - Stores responses to questionnaires
- `farmer_groups` - Stores farmer group information
- `training_participations` - Tracks training participation

### 4. Initialize Database
Run the database initialization script to create indexes:
```bash
# This is automatically handled by the application
# Indexes are created when the first database connection is established
```

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Livestock Management
- `GET /api/livestock` - Get all livestock (with filters)
- `POST /api/livestock` - Create new livestock record
- `GET /api/livestock/:id` - Get livestock by ID
- `PUT /api/livestock/:id` - Update livestock record
- `DELETE /api/livestock/:id` - Delete livestock record
- `GET /api/livestock/stats` - Get livestock statistics by animal type

### Training Program Management
- `GET /api/training-programs` - Get all training programs
- `POST /api/training-programs` - Create new training program
- `GET /api/training-programs/:id` - Get training program by ID
- `PUT /api/training-programs/:id` - Update training program
- `DELETE /api/training-programs/:id` - Delete training program

### Article Management
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create new article
- `GET /api/articles/:id` - Get article by ID
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Questionnaire Management
- `GET /api/questionnaires` - Get all questionnaires
- `POST /api/questionnaires` - Create new questionnaire
- `GET /api/questionnaires/:id` - Get questionnaire by ID
- `PUT /api/questionnaires/:id` - Update questionnaire
- `DELETE /api/questionnaires/:id` - Delete questionnaire

### Questionnaire Response Management
- `GET /api/questionnaire-responses` - Get all questionnaire responses
- `POST /api/questionnaire-responses` - Create new questionnaire response
- `GET /api/questionnaire-responses/:id` - Get questionnaire response by ID
- `PUT /api/questionnaire-responses/:id` - Update questionnaire response
- `DELETE /api/questionnaire-responses/:id` - Delete questionnaire response

## Data Migration

### Automatic Migration
The system includes an automatic migration feature that can migrate all data from localStorage to MongoDB:
- Visit `/test-mongodb` and click "Migrate All Data from localStorage to MongoDB"

### Manual Migration
You can also run the migration script directly:
```bash
# Run the migration script
node src/lib/migrate-localstorage.js
```

## Testing the Integration

### Automated Testing
Visit the test page at `/test-mongodb` to run automated tests that verify:
- User creation
- Livestock data creation
- Data fetching
- Data updating
- Data deletion

### Integration Testing
Visit the integration test page at `/test-mongodb-integration` to run comprehensive tests that verify:
- Complete data flow from creation to retrieval
- Statistics calculation
- Questionnaire and response handling
- All API endpoints working correctly

### Livestock Statistics Testing
Visit the livestock statistics test page at `/test-livestock-stats` to run tests that verify:
- Livestock data creation with different animal types
- Statistics calculation by animal type
- Display of statistics in the format shown in the reference image

### Manual Testing
To manually test the MongoDB integration:

1. Start your MongoDB server
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
3. Access the application and verify that data is being stored in MongoDB instead of localStorage

## Data Models

### User Model
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

### Livestock Model
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

### Training Program Model
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

### Article Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  judul: String,
  konten: String,
  gambar: String,
  kategori: String,
  status: String, // "published", "draft"
  createdAt: Date,
  updatedAt: Date
}
```

### Questionnaire Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User (penyuluh)
  judul: String,
  deskripsi: String,
  pertanyaan: [
    {
      id: Number,
      teks: String,
      tipe: String, // "pilihan_ganda", "text"
      opsi: [String] // For multiple choice questions
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Questionnaire Response Model
```javascript
{
  _id: ObjectId,
  questionnaireId: ObjectId, // Reference to Questionnaire
  userId: ObjectId, // Reference to User (peternak)
  responses: [
    {
      pertanyaanId: String,
      jawaban: String
    }
  ],
  submittedAt: Date
}
```

## Authentication
The system uses bcryptjs for password hashing and a simple token-based authentication system for API endpoints.

## Security Considerations
1. Passwords are hashed using bcryptjs before storage
2. API endpoints should be protected with proper authentication middleware
3. Input validation should be implemented for all data operations
4. Environment variables should not be committed to version control

## Troubleshooting

### Connection Issues
- Verify MongoDB is running:
  ```bash
  # For local MongoDB
  mongod
  
  # For MongoDB Atlas, verify your connection string
  ```
- Check environment variables in `.env.local`
- Ensure MongoDB URI is correctly formatted

### Data Not Loading
- Check browser console for API errors
- Verify MongoDB collections exist and have data
- Check network tab in browser dev tools for failed API requests

### Performance Issues
- Ensure indexes are created on frequently queried fields
- Check MongoDB logs for slow queries
- Consider adding pagination for large datasets

## Components Updated for MongoDB Integration

### Dashboard Pages
- `/dashboard/peternak` - Now fetches livestock count and questionnaire data from MongoDB
- `/dashboard/penyuluh` - Now fetches training program data from MongoDB
- `/dashboard/admin` - Now fetches user and article data from MongoDB

### Livestock Management
- `/peternak/ternak/tambah` - Now saves to MongoDB instead of localStorage
- `/peternak/ternak/lihat` - Now fetches from MongoDB and displays statistics by animal type
- `/peternak/ternak/edit` - Now updates MongoDB records

### Questionnaire System
- `/peternak/kuesioner` - Now fetches questionnaires and responses from MongoDB
- `/peternak/kuesioner/isiform` - Now saves responses to MongoDB
- `/peternak/kuesioner/lihatform` - Now fetches responses from MongoDB

### Training Programs
- `/dashboard/penyuluh/pelatihan` - Now fetches from MongoDB
- `/dashboard/penyuluh/pelatihan/tambah` - Now saves to MongoDB
- `/dashboard/penyuluh/pelatihan/edit/[id]` - Now updates MongoDB records

## Key Features Implemented

### Livestock Statistics Display
The `/peternak/ternak/lihat` page now displays livestock data in the format shown in the reference image:
- Visual representation of livestock by animal type with icons
- Count of each animal type displayed prominently
- Clean, grid-based layout with animal icons
- Detailed table view for specific livestock data
- Filtering capabilities by animal type, gender, health condition, etc.

### Data Relationships
- Proper relationships between users and their livestock data
- Efficient querying for statistics and filtering
- Consistent data structure across all components

## Next Steps
1. Implement proper user authentication with session management
2. Add data validation and error handling to all API endpoints
3. Implement pagination for large datasets
4. Add caching for frequently accessed data
5. Set up proper logging and monitoring
6. Implement data backup and recovery procedures