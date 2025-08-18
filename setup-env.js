const fs = require('fs');
const path = require('path');

// Check if .env.local already exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('.env.local file already exists. Skipping creation.');
  process.exit(0);
}

// Create .env.local file with default values for static implementation
const envContent = `# Environment configuration for static implementation
# MongoDB settings have been removed for static implementation

# API URL for frontend - For development, this points to localhost (do not include /api)
NEXT_PUBLIC_API_URL=http://localhost:3000
`;

fs.writeFileSync(envLocalPath, envContent);
console.log('.env.local file created successfully for static implementation!');
console.log('This implementation uses static user data instead of MongoDB.');