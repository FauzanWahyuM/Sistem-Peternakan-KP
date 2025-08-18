# Troubleshooting Authentication Issues - Static Implementation

## Problem Description

This document helps troubleshoot common issues with the static implementation of the authentication system.

## Common Issues and Solutions

### 1. Login Issues

**Issue**: Unable to log in with predefined users.

**Solution**:
1. Verify you're using the correct predefined usernames and passwords:
   - Admin User: username "admin", password "password"
   - Penyuluh User: username "penyuluh", password "password"
   - Peternak User: username "peternak", password "password"
2. Check that the application is running without errors
3. Verify that the static user data file (`src/lib/static-users.js`) exists and is correctly formatted

### 2. Registration Issues

**Issue**: Registration appears to work but data is not persisted.

**Solution**:
- This is expected behavior for the static implementation
- Registration works during the current session but data is not persisted between server restarts
- For production use, a proper database implementation would be needed

### 3. "Failed to Fetch" Errors

**Issue**: Receiving "failed to fetch" errors when trying to authenticate.

**Solution**:
1. Check that the development server is running (`npm run dev`)
2. Verify that API routes are working correctly by testing:
   - `http://localhost:3000/api/test-api`
   - `http://localhost:3000/api/auth/login`
   - `http://localhost:3000/api/auth/register`
3. Check the browser's developer tools Network tab for detailed error information

## Step-by-Step Troubleshooting Guide

### Step 1: Verify Development Server

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Check the terminal for any error messages
3. Verify the server is accessible at `http://localhost:3000`

### Step 2: Test API Routes Directly

1. Open your browser and navigate to:
   - `http://localhost:3000/api/test-api`
   - `http://localhost:3000/api/auth/login`
   - `http://localhost:3000/api/auth/register`
2. Check that these routes return valid JSON responses

### Step 3: Check Browser Developer Tools

1. Open your browser's developer tools (F12)
2. Go to the "Network" tab
3. Try to log in or register
4. Look for failed requests and check their details:
   - Status code
   - Error message
   - Request URL

### Step 4: Verify Static User Data

1. Check that `src/lib/static-users.js` exists
2. Verify the file contains the predefined users
3. Ensure the file is correctly imported in `src/models/User.js`

## Testing Your Authentication

After implementing the above solutions:

1. Start the development server: `npm run dev`
2. Visit the login page: `http://localhost:3000/login`
3. Try to log in with one of the predefined users
4. Check the browser console for any remaining errors

## Additional Debugging Tips

### Enable Detailed Logging

Add more console.log statements to your API routes to help identify where the issue occurs:

```javascript
// In your API route files
console.log('API route called');
console.log('Request body:', body);
```

### Test Authentication Separately

Run the authentication test script:

```bash
npm run test-auth
```

This will test the authentication system independently of the web interface.

## Need More Help?

If you're still experiencing issues:

1. Check the Next.js documentation: https://nextjs.org/docs
2. Review the static implementation guide in [STATIC_IMPLEMENTATION.md](STATIC_IMPLEMENTATION.md)
3. Check the updated deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)