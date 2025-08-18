# Static Data Design for SIMANTEK System

## Overview
This document outlines the static data structure for the Sistem Informasi Penjaminan Mutu Kelompok Peternak (SIMANTEK) application. The system has three main user roles:
1. Admin - System administrator
2. Penyuluh - Extension officer/trainer
3. Peternak - Farmer

## Static Data Structure

### 1. Users Data
Stores all user information including authentication details and role-based access.

```javascript
const staticUsers = [
  {
    id: String,
    nama: String,
    username: String,
    email: String,
    password: String, // Hashed password
    role: String, // "admin", "penyuluh", "peternak"
    kelompok: String, // For peternak role
    status: String, // "Aktif"
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 2. Livestock Data
Stores livestock data managed by peternak users.

```javascript
const staticLivestock = [
  {
    id: String,
    userId: String, // Reference to Users data (peternak)
    jenisHewan: String, // "Sapi", "Kambing", "Domba", "Ayam", "Bebek"
    jenisKelamin: String, // "Jantan", "Betina"
    umurTernak: String,
    statusTernak: String, // Based on animal type and gender
    kondisiKesehatan: String, // "Sehat", "Sakit"
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 3. Training Programs Data
Stores training program information managed by penyuluh users.

```javascript
const staticTrainingPrograms = [
  {
    id: String,
    userId: String, // Reference to Users data (penyuluh)
    judul: String,
    deskripsi: String,
    tanggal: Date,
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 4. Articles Data
Stores articles managed by admin users.

```javascript
const staticArticles = [
  {
    id: String,
    userId: String, // Reference to Users data (admin/penyuluh)
    judul: String,
    deskripsi: String,
    kategori: String,
    status: String, // "published", "draft"
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 5. Questionnaires Data
Stores questionnaire templates created by penyuluh for peternak.

```javascript
const staticQuestionnaires = [
  {
    id: String,
    userId: String, // Reference to Users data (penyuluh)
    judul: String,
    deskripsi: String,
    pertanyaan: [
      {
        id: String,
        text: String,
        type: String // "text", "boolean"
      }
    ],
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 6. Questionnaire Responses Data
Stores responses from peternak to questionnaires.

```javascript
const staticQuestionnaireResponses = [
  {
    id: String,
    questionnaireId: String, // Reference to Questionnaires data
    userId: String, // Reference to Users data (peternak)
    jawaban: [
      {
        questionId: String,
        answer: String
      }
    ],
    submittedAt: Date
  }
];
```

### 7. Farmer Groups Data
Stores information about farmer groups/communities.

```javascript
const staticFarmerGroups = [
  {
    id: String,
    nama: String,
    deskripsi: String,
    anggota: [
      {
        userId: String, // Reference to Users data
        nama: String,
        role: String // "member"
      }
    ],
    createdAt: Date,
    updatedAt: Date
  }
];
```

### 8. Training Participation Data
Tracks which farmers participated in which training programs.

```javascript
const staticTrainingParticipations = [
  {
    id: String,
    trainingId: String, // Reference to Training Programs data
    userId: String, // Reference to Users data (peternak)
    status: String, // "registered", "completed"
    registrationDate: Date,
    completionDate: Date
  }
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

## Data Persistence

Note: In the static implementation, all data is stored in memory and will be reset when the server restarts. For production use, a proper database implementation would be needed.

## Benefits of Static Implementation

1. **No Database Setup Required**: Eliminates all database configuration issues
2. **Simplified Deployment**: No need to configure MongoDB Atlas or any database service
3. **Faster Development**: No database connection delays or issues
4. **Easier Testing**: Predefined data makes testing more predictable
5. **Reduced Dependencies**: Removed MongoDB and related packages