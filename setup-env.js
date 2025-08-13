const fs = require('fs');
const path = require('path');

// Check if .env.local already exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('.env.local file already exists. Skipping creation.');
  process.exit(0);
}

// Create .env.local file with default values
const envContent = `# MongoDB Configuration for Development
MONGODB_URI=mongodb://localhost:27017/simantek
MONGODB_DB=simantek

# For production deployment (Vercel), use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek

# API URL for frontend - For development, this points to localhost (do not include /api)
NEXT_PUBLIC_API_URL=http://localhost:3000
`;

fs.writeFileSync(envLocalPath, envContent);
console.log('.env.local file created successfully!');
console.log('Please update the MongoDB connection details in .env.local as needed.');
console.log('');
console.log('For production deployment:');
console.log('1. Set up MongoDB Atlas (see DEPLOYMENT.md)');
console.log('2. Update environment variables in Vercel dashboard');
console.log('3. Set MONGODB_URI to your MongoDB Atlas connection string');
console.log('4. Set NEXT_PUBLIC_API_URL to your Vercel deployment URL');