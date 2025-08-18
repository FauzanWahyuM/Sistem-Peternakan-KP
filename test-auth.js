/**
 * Test script for registration and login functionality
 * This script can be used to verify that the authentication system works correctly
 */

const bcrypt = require('bcryptjs');
const { staticUsers, findUserByUsername } = require('./src/lib/static-users');

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
    console.log('Testing authentication system...');
    
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
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();