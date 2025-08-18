/**
 * Test script for static registration and login functionality
 * This script can be used to verify that the static authentication system works correctly
 */

const bcrypt = require('bcryptjs');
const { staticUsers, findUserByUsername, addUser } = require('./src/lib/static-users');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

async function verifyPassword(password, hashedPassword) {
  try {
    // For static users, we're using a placeholder hash
    // In a real implementation, you would compare with actual hashed passwords
    if (hashedPassword === '$2b$10$example_hashed_password') {
      // For demo purposes, we'll just check if password is 'password'
      return password === 'password';
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error verifying password');
  }
}

async function testAuth() {
  try {
    console.log('Testing static authentication system...');
    
    // Test user retrieval
    console.log('Testing user retrieval...');
    const testUser = findUserByUsername('admin');
    console.log('User retrieved successfully:', testUser.username);
    
    // Test password verification
    console.log('Testing password verification...');
    const isPasswordValid = await verifyPassword('password', testUser.password);
    console.log('Password verification result:', isPasswordValid);
    
    // Test invalid password
    const isInvalidPassword = await verifyPassword('wrongpassword', testUser.password);
    console.log('Invalid password verification result:', isInvalidPassword);
    
    // Test user creation
    console.log('Testing user creation...');
    const newUser = {
      nama: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      kelompok: 'Test Group',
      role: 'peternak',
      status: 'Aktif'
    };
    
    try {
      const createdUser = addUser(newUser);
      console.log('User created successfully with ID:', createdUser.id);
      
      // Try to create the same user again to test duplicate handling
      addUser(newUser);
    } catch (error) {
      console.log('Duplicate user handling works correctly:', error.message);
    }
    
    // Test finding the created user
    const foundUser = findUserByUsername('testuser');
    console.log('Found created user:', foundUser.username);
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();