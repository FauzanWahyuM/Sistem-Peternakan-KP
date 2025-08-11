const fs = require('fs');
const path = require('path');

// Check if .env.local already exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('.env.local file already exists. Skipping creation.');
  process.exit(0);
}

// Create .env.local file with default values
const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/simantek
MONGODB_DB=simantek

# Uncomment and modify the following lines if using MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek
`;

fs.writeFileSync(envLocalPath, envContent);
console.log('.env.local file created successfully!');
console.log('Please update the MongoDB connection details in .env.local as needed.');