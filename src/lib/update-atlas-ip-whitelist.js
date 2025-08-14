/**
 * Script to update MongoDB Atlas IP whitelist to 0.0.0.0/0
 * 
 * This script provides guidance on how to configure your MongoDB Atlas
 * cluster to accept connections from any IP address, which is useful
 * for development but NOT recommended for production environments.
 * 
 * To use this feature:
 * 1. Go to https://cloud.mongodb.com/
 * 2. Select your cluster
 * 3. Go to the "Network Access" tab
 * 4. Click "Add IP Address"
 * 5. Enter "0.0.0.0/0" in the "Access List Entry" field
 * 6. Add a comment like "Development - Allow all IPs" 
 * 7. Click "Confirm"
 * 
 * WARNING: This setting allows connections from ANY IP address.
 * For production, specify only the IP addresses that need access.
 */

console.log(`
==================================================
MongoDB Atlas IP Whitelist Configuration
==================================================

For development purposes, you can set your MongoDB Atlas IP whitelist to 0.0.0.0/0:

STEPS:
1. Go to https://cloud.mongodb.com/
2. Select your cluster
3. Go to the "Network Access" tab
4. Click "Add IP Address"
5. Enter "0.0.0.0/0" in the "Access List Entry" field
6. Add a comment like "Development - Allow all IPs" 
7. Click "Confirm"

WARNING:
--------
This setting allows connections from ANY IP address.
For production environments, specify only the IP addresses that need access.

Current configuration in .env.local:
MONGODB_ATLAS_URI=${process.env.MONGODB_ATLAS_URI || 'Not set'}
`);

// Export an empty function to satisfy module requirements
module.exports = () => {};