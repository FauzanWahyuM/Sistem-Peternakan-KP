// Client-side authentication utilities
import { staticUsers, findUserByUsername, addUser } from './static-users.js';

// Simple password verification for static implementation
// In a real application, you would use proper password hashing
function verifyPassword(inputPassword, storedPassword) {
  // For demo purposes, we'll just check if password is 'password'
  // In a real implementation, you would compare hashed passwords
  return inputPassword === 'password' || storedPassword === '$2b$10$example_hashed_password';
}

// Generate a simple token for client-side auth
function generateToken(user) {
  return Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role
  })).toString('base64');
}

// Verify a token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return payload;
  } catch (error) {
    return null;
  }
}

export class ClientAuth {
  static async login(username, password) {
    try {
      // Find user by username
      const user = findUserByUsername(username);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      if (!verifyPassword(password, user.password)) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate token
      const token = generateToken(userWithoutPassword);
      
      return {
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async register(userData) {
    try {
      // Add user to static users
      const user = addUser(userData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        message: 'User created successfully',
        user: userWithoutPassword
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Function to get current user from token
  static getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = verifyToken(token);
    if (!payload) return null;
    
    return payload;
  }
  
  // Function to check if user is logged in
  static isLoggedIn() {
    return !!localStorage.getItem('token');
  }
  
  // Function to logout
  static logout() {
    localStorage.removeItem('token');
  }
  
  // Function to get user role
  static getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}