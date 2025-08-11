/**
 * Migration script to transfer data from localStorage to MongoDB
 * This script should be run once to migrate existing data
 */

import { connectToDatabase } from './mongodb';
import { UserModel } from '../models/User';
import { LivestockModel } from '../models/Livestock';
import { TrainingProgramModel } from '../models/TrainingProgram';

// Mock data that represents what might be in localStorage
// In a real scenario, this would be extracted from actual localStorage data
const mockLocalStorageData = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      username: 'admin',
      email: 'admin@simantek.com',
      password: '$2b$10$example_hashed_password',
      role: 'admin',
      kelompok: null
    },
    {
      id: '2',
      name: 'Penyuluh User',
      username: 'penyuluh',
      email: 'penyuluh@simantek.com',
      password: '$2b$10$example_hashed_password',
      role: 'penyuluh',
      kelompok: null
    },
    {
      id: '3',
      name: 'Peternak User',
      username: 'peternak',
      email: 'peternak@simantek.com',
      password: '$2b$10$example_hashed_password',
      role: 'peternak',
      kelompok: 'Kelompok Ternak Maju'
    }
  ],
  ternakList: [
    {
      id: '101',
      jenisHewan: 'Sapi',
      jenisKelamin: 'Betina',
      umurTernak: '3 tahun',
      statusTernak: 'Indukan',
      kondisiKesehatan: 'Sehat',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '102',
      jenisHewan: 'Kambing',
      jenisKelamin: 'Jantan',
      umurTernak: '2 tahun',
      statusTernak: 'Pejantan',
      kondisiKesehatan: 'Sehat',
      createdAt: '2025-02-20T14:45:00Z'
    }
  ],
  pelatihan_data: [
    {
      id: 1,
      judul: 'Pemahaman Dasar Peternakan Modern',
      deskripsi: 'Pembelajaran tentang teknologi terbaru dalam bidang peternakan',
      gambar: 'Foto.jpg',
      tanggal: '2025-02-11',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      judul: 'Artikel Manajemen Pakan Ternak',
      deskripsi: 'Panduan lengkap mengenai nutrisi dan manajemen pakan',
      gambar: 'Foto.png',
      tanggal: '2025-03-16',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ]
};

export async function migrateLocalStorageToMongoDB() {
  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Migrate users
    console.log('Migrating users...');
    for (const user of mockLocalStorageData.users) {
      // Check if user already exists
      const existingUser = await UserModel.findByUsername(user.username);
      if (!existingUser) {
        const userData = {
          name: user.name,
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          kelompok: user.kelompok,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const createdUser = await UserModel.create(userData);
        console.log(`Created user: ${createdUser.username}`);
      } else {
        console.log(`User ${user.username} already exists`);
      }
    }
    
    // Migrate livestock data
    console.log('Migrating livestock data...');
    // Note: In a real scenario, we would need to associate livestock with actual user IDs
    // For this example, we'll associate with the first peternak user
    const peternakUser = await UserModel.findByUsername('peternak');
    if (peternakUser) {
      for (const ternak of mockLocalStorageData.ternakList) {
        const livestockData = {
          userId: peternakUser._id,
          jenisHewan: ternak.jenisHewan,
          jenisKelamin: ternak.jenisKelamin,
          umurTernak: ternak.umurTernak,
          statusTernak: ternak.statusTernak,
          kondisiKesehatan: ternak.kondisiKesehatan,
          createdAt: new Date(ternak.createdAt),
          updatedAt: new Date()
        };
        
        const createdLivestock = await LivestockModel.create(livestockData);
        console.log(`Created livestock record: ${createdLivestock.jenisHewan}`);
      }
    }
    
    // Migrate training programs
    console.log('Migrating training programs...');
    // Associate with penyuluh user
    const penyuluhUser = await UserModel.findByUsername('penyuluh');
    if (penyuluhUser) {
      for (const pelatihan of mockLocalStorageData.pelatihan_data) {
        const trainingData = {
          userId: penyuluhUser._id,
          judul: pelatihan.judul,
          deskripsi: pelatihan.deskripsi,
          gambar: pelatihan.gambar,
          tanggal: new Date(pelatihan.tanggal),
          createdAt: new Date(pelatihan.createdAt),
          updatedAt: new Date(pelatihan.updatedAt)
        };
        
        const createdTraining = await TrainingProgramModel.create(trainingData);
        console.log(`Created training program: ${createdTraining.judul}`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Function to extract data from actual localStorage (to be run in browser context)
export function extractLocalStorageData() {
  // This function would be called in the browser context to extract localStorage data
  // and then sent to the server for migration
  
  if (typeof window === 'undefined') {
    console.log('This function must be run in a browser context');
    return null;
  }
  
  const localStorageData = {};
  
  // Extract users
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    localStorageData.users = users;
  } catch (e) {
    console.log('No users found in localStorage');
    localStorageData.users = [];
  }
  
  // Extract livestock data
  try {
    const ternakList = JSON.parse(localStorage.getItem('ternakList') || '[]');
    localStorageData.ternakList = ternakList;
  } catch (e) {
    console.log('No livestock data found in localStorage');
    localStorageData.ternakList = [];
  }
  
  // Extract training programs
  try {
    const pelatihanData = JSON.parse(localStorage.getItem('pelatihan_data') || '[]');
    localStorageData.pelatihan_data = pelatihanData;
  } catch (e) {
    console.log('No training data found in localStorage');
    localStorageData.pelatihan_data = [];
  }
  
  return localStorageData;
}

// Function to run migration from extracted localStorage data
export async function migrateFromExtractedData(extractedData) {
  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Migrate users
    console.log('Migrating users...');
    if (extractedData.users && extractedData.users.length > 0) {
      for (const user of extractedData.users) {
        // Check if user already exists
        const existingUser = await UserModel.findByUsername(user.username);
        if (!existingUser) {
          const userData = {
            name: user.name,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
            kelompok: user.kelompok,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          };
          
          const createdUser = await UserModel.create(userData);
          console.log(`Created user: ${createdUser.username}`);
        } else {
          console.log(`User ${user.username} already exists`);
        }
      }
    }
    
    // Migrate livestock data
    console.log('Migrating livestock data...');
    if (extractedData.ternakList && extractedData.ternakList.length > 0) {
      // For this example, we'll associate with the first peternak user
      // In a real scenario, you would need to map localStorage user IDs to MongoDB user IDs
      const peternakUsers = await UserModel.findByRole('peternak');
      if (peternakUsers.length > 0) {
        const peternakUser = peternakUsers[0]; // Use first peternak user
        
        for (const ternak of extractedData.ternakList) {
          const livestockData = {
            userId: peternakUser._id,
            jenisHewan: ternak.jenisHewan,
            jenisKelamin: ternak.jenisKelamin,
            umurTernak: ternak.umurTernak,
            statusTernak: ternak.statusTernak,
            kondisiKesehatan: ternak.kondisiKesehatan,
            createdAt: ternak.createdAt ? new Date(ternak.createdAt) : new Date(),
            updatedAt: ternak.updatedAt ? new Date(ternak.updatedAt) : new Date()
          };
          
          const createdLivestock = await LivestockModel.create(livestockData);
          console.log(`Created livestock record: ${createdLivestock.jenisHewan}`);
        }
      }
    }
    
    // Migrate training programs
    console.log('Migrating training programs...');
    if (extractedData.pelatihan_data && extractedData.pelatihan_data.length > 0) {
      // Associate with penyuluh user
      const penyuluhUsers = await UserModel.findByRole('penyuluh');
      if (penyuluhUsers.length > 0) {
        const penyuluhUser = penyuluhUsers[0]; // Use first penyuluh user
        
        for (const pelatihan of extractedData.pelatihan_data) {
          const trainingData = {
            userId: penyuluhUser._id,
            judul: pelatihan.judul,
            deskripsi: pelatihan.deskripsi,
            gambar: pelatihan.gambar,
            tanggal: pelatihan.tanggal ? new Date(pelatihan.tanggal) : new Date(),
            createdAt: pelatihan.createdAt ? new Date(pelatihan.createdAt) : new Date(),
            updatedAt: pelatihan.updatedAt ? new Date(pelatihan.updatedAt) : new Date()
          };
          
          const createdTraining = await TrainingProgramModel.create(trainingData);
          console.log(`Created training program: ${createdTraining.judul}`);
        }
      }
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}