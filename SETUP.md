# SIMANTEK MongoDB Setup Guide

## Overview
This guide will help you set up MongoDB integration for the SIMANTEK application.

## Prerequisites
1. Node.js (version 14 or higher)
2. npm (comes with Node.js)
3. MongoDB server (local installation or MongoDB Atlas account)

## Setup Steps

### 1. Install MongoDB (If not already installed)

#### Option A: Local Installation
**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Configure network access to allow connections from your IP
4. Create a database user
5. Get your connection string from the "Connect" button

### 2. Set Up the Application

1. **Navigate to the project directory:**
   ```bash
   cd path/to/simantek
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   npm run setup-env
   ```
   
   This will create a `.env.local` file with default MongoDB configuration.

4. **Configure MongoDB connection:**
   Edit the `.env.local` file to match your MongoDB setup:
   
   For local MongoDB:
   ```env
   MONGODB_URI=mongodb://localhost:27017/simantek
   MONGODB_DB=simantek
   ```
   
   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek
   MONGODB_DB=simantek
   ```


### 4. Run the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   http://localhost:3000

### 5. Migrate Existing Data

If you have existing data in localStorage that you want to migrate to MongoDB:

1. **Start the application** (if not already running)
2. **Navigate to the migration endpoint:**
   http://localhost:3000/api/migrate
   
   You should see a success message indicating that data has been migrated.

## Troubleshooting

### Common Issues and Solutions

1. **"MongoNetworkError: failed to connect to server":**
   - Ensure MongoDB is running
   - Check your connection string in `.env.local`
   - Verify firewall settings

2. **"Authentication failed":**
   - Check username and password in connection string
   - Ensure the database user has proper permissions

3. **"EACCES: permission denied" (Linux/macOS):**
   - Run commands with sudo if needed
   - Check file permissions

4. **"Module not found: mongodb":**
   - Run `npm install mongodb bcryptjs`

5. **Environment variables not loading:**
   - Ensure `.env.local` is in the root directory
   - Restart the development server

### Debugging Steps

1. **Check MongoDB service status:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Test connection with MongoDB shell:**
   ```bash
   mongosh mongodb://localhost:27017/simantek
   ```

3. **Check application logs:**
   Look at the terminal output when running `npm run dev` for any error messages.

## Security Considerations

1. **Never commit `.env.local` to version control**
2. **Use strong passwords for database users**
3. **Restrict network access to your MongoDB instance**
4. **Use environment-specific configuration files**

## Next Steps

1. **Explore the application** and verify data is being stored in MongoDB
2. **Review the database schema** in `docs/database-design.md`
3. **Check the API documentation** in `README-MONGODB.md`
4. **Review the migration guide** in `MIGRATION-GUIDE.md` for detailed information about the changes
