// Test script to verify API client works with MongoDB Atlas
const { ApiClient } = require('./api-client');

async function testApiClient() {
  try {
    console.log('Testing API client with MongoDB Atlas...');
    
    // Test fetching users
    console.log('Fetching users...');
    const usersResponse = await ApiClient.getUsers();
    console.log('Users fetched successfully:', usersResponse.users.length, 'users found');
    
    console.log('API client test completed successfully!');
  } catch (error) {
    console.error('API client test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApiClient();
}