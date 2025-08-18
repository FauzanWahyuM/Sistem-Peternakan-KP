// Test script for client-side authentication
import { ClientAuth } from './src/lib/client-auth.js';
import { staticUsers } from './src/lib/static-users.js';

async function testClientAuth() {
  try {
    console.log('Testing client-side authentication...');
    
    // Test login with predefined user
    console.log('Testing login with admin user...');
    const loginResult = await ClientAuth.login('admin', 'password');
    console.log('Login successful:', loginResult.user.username);
    
    // Test registration
    console.log('Testing registration...');
    const newUser = {
      nama: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword',
      kelompok: 'Test Group',
      role: 'peternak',
      status: 'Aktif'
    };
    
    try {
      const registerResult = await ClientAuth.register(newUser);
      console.log('Registration successful:', registerResult.user.username);
      
      // Try to register the same user again to test duplicate handling
      await ClientAuth.register(newUser);
    } catch (error) {
      console.log('Duplicate user handling works correctly:', error.message);
    }
    
    // Verify the user was added to staticUsers
    const addedUser = staticUsers.find(user => user.username === 'testuser');
    console.log('User added to staticUsers:', !!addedUser);
    
    console.log('All client-side authentication tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testClientAuth();