// Static user data to replace MongoDB
export const staticUsers = [
  {
    id: '1',
    nama: 'Admin User',
    username: 'admin',
    email: 'admin@simantek.com',
    password: '$2b$10$example_hashed_password', // This should be properly hashed
    kelompok: 'Administrator',
    role: 'admin',
    status: 'Aktif',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    nama: 'Penyuluh User',
    username: 'penyuluh',
    email: 'penyuluh@simantek.com',
    password: '$2b$10$example_hashed_password', // This should be properly hashed
    kelompok: 'Penyuluh',
    role: 'penyuluh',
    status: 'Aktif',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '3',
    nama: 'Peternak User',
    username: 'peternak',
    email: 'peternak@simantek.com',
    password: '$2b$10$example_hashed_password', // This should be properly hashed
    kelompok: 'Kelompok Peternak 1',
    role: 'peternak',
    status: 'Aktif',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

// Function to find user by username
export function findUserByUsername(username) {
  return staticUsers.find(user => user.username === username);
}

// Function to find user by email
export function findUserByEmail(email) {
  return staticUsers.find(user => user.email === email);
}

// Function to find user by id
export function findUserById(id) {
  return staticUsers.find(user => user.id === id);
}

// Function to add a new user
export function addUser(userData) {
  // Check if user already exists
  if (findUserByUsername(userData.username)) {
    throw new Error('Username already exists');
  }
  
  if (findUserByEmail(userData.email)) {
    throw new Error('Email already exists');
  }
  
  // Create new user with auto-incremented id
  const newUser = {
    id: String(staticUsers.length + 1),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  staticUsers.push(newUser);
  return newUser;
}

// Function to get all users
export function getAllUsers() {
  return staticUsers;
}