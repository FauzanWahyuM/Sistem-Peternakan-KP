# MongoDB Database Design for SIMANTEK System

## Overview
This document outlines the MongoDB database structure for the Sistem Informasi Penjaminan Mutu Kelompok Peternak (SIMANTEK) application. The system has three main user roles:
1. Admin - System administrator
2. Penyuluh - Extension officer/trainer
3. Peternak - Farmer

## Database Collections

### 1. Users Collection
Stores all user information including authentication details and role-based access.

```javascript
{
  _id: ObjectId,
  name: String,
  username: String,
  email: String,
  password: String, // Hashed password
  role: String, // "admin", "penyuluh", "peternak"
  kelompok: String, // For peternak role
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 2. Livestock Collection
Stores livestock data managed by peternak users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection (peternak)
  jenisHewan: String, // "Sapi", "Kambing", "Domba", "Ayam", "Bebek"
  jenisKelamin: String, // "Jantan", "Betina"
  umurTernak: String,
  statusTernak: String, // Based on animal type and gender
  kondisiKesehatan: String, // "Sehat", "Sakit"
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Training Programs Collection
Stores training program information managed by penyuluh users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection (penyuluh)
  judul: String,
  deskripsi: String,
  gambar: String, // File path or URL
  tanggal: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Articles Collection
Stores articles managed by admin users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection (admin/penyuluh)
  judul: String,
  konten: String,
  gambar: String, // File path or URL
  kategori: String,
  status: String, // "published", "draft"
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Questionnaires Collection
Stores questionnaire templates created by penyuluh for peternak.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection (penyuluh)
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

### 6. Questionnaire Responses Collection
Stores responses from peternak to questionnaires.

```javascript
{
  _id: ObjectId,
  questionnaireId: ObjectId, // Reference to Questionnaires collection
  userId: ObjectId, // Reference to Users collection (peternak)
  responses: [
    {
      pertanyaanId: Number,
      jawaban: String
    }
  ],
  submittedAt: Date
}
```

### 7. Farmer Groups Collection
Stores information about farmer groups/communities.

```javascript
{
  _id: ObjectId,
  nama: String,
  alamat: String,
  jenisTernakUtama: String,
  jumlahTernak: Number,
  tahunBerdiri: Number,
  gambar: String, // File path or URL
  anggota: [
    {
      userId: ObjectId, // Reference to Users collection
      role: String // "ketua", "anggota"
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Training Participation Collection
Tracks which farmers participated in which training programs.

```javascript
{
  _id: ObjectId,
  trainingId: ObjectId, // Reference to Training Programs collection
  userId: ObjectId, // Reference to Users collection (peternak)
  status: String, // "registered", "completed", "cancelled"
  registrationDate: Date,
  completionDate: Date
}
```

## Relationships

1. **Users** (1) → (Many) **Livestock** - One peternak can have many livestock
2. **Users** (1) → (Many) **Training Programs** - One penyuluh can create many training programs
3. **Users** (1) → (Many) **Articles** - Users can create many articles
4. **Users** (1) → (Many) **Questionnaires** - Penyuluh can create many questionnaires
5. **Questionnaires** (1) → (Many) **Questionnaire Responses** - One questionnaire can have many responses
6. **Farmer Groups** (Many) ↔ (Many) **Users** - Many groups can have many users (with roles)
7. **Training Programs** (1) → (Many) **Training Participation** - One training can have many participants

## Indexes

To optimize query performance, the following indexes should be created:

1. Users collection:
   - `username` (unique)
   - `email` (unique)
   - `role`

2. Livestock collection:
   - `userId`
   - `jenisHewan`
   - `kondisiKesehatan`

3. Training Programs collection:
   - `userId`
   - `tanggal`

4. Articles collection:
   - `userId`
   - `status`
   - `kategori`

5. Questionnaires collection:
   - `userId`

6. Questionnaire Responses collection:
   - `questionnaireId`
   - `userId`

7. Farmer Groups collection:
   - `nama`

8. Training Participation collection:
   - `trainingId`
   - `userId`
   - `status`