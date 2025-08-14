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
# For local development, you can use a local MongoDB instance:
# MONGODB_URI=mongodb://localhost:27017/simantek

# For MongoDB Atlas (recommended for development and production):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek
MONGODB_DB=simantek

# API URL for frontend - For development, this points to localhost (do not include /api)
NEXT_PUBLIC_API_URL=http://localhost:3000
`;

fs.writeFileSync(envLocalPath, envContent);
console.log('.env.local file created successfully!');
console.log('Please update the MongoDB connection details in .env.local as needed.');
console.log('');
console.log('For MongoDB Atlas setup:');
console.log('1. Update MONGODB_URI with your MongoDB Atlas connection string');
29 | console.log('2. Set NEXT_PUBLIC_API_URL to your Vercel deployment URL (if deploying)');