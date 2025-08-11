/**
 * API Client for MongoDB backend
 * This replaces localStorage operations with API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  // Users API
  static async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Livestock API
  static async getLivestock(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams 
        ? `${API_BASE_URL}/livestock?${queryParams}`
        : `${API_BASE_URL}/livestock`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch livestock');
      return await response.json();
    } catch (error) {
      console.error('Error fetching livestock:', error);
      throw error;
    }
  }

  static async createLivestock(livestockData) {
    try {
      const response = await fetch(`${API_BASE_URL}/livestock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(livestockData),
      });
      
      if (!response.ok) throw new Error('Failed to create livestock record');
      return await response.json();
    } catch (error) {
      console.error('Error creating livestock record:', error);
      throw error;
    }
  }

  static async updateLivestock(id, livestockData) {
    try {
      const response = await fetch(`${API_BASE_URL}/livestock/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(livestockData),
      });
      
      if (!response.ok) throw new Error('Failed to update livestock record');
      return await response.json();
    } catch (error) {
      console.error('Error updating livestock record:', error);
      throw error;
    }
  }

  static async deleteLivestock(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/livestock/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete livestock record');
      return await response.json();
    } catch (error) {
      console.error('Error deleting livestock record:', error);
      throw error;
    }
  }

  // Training Programs API
  static async getTrainingPrograms(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams 
        ? `${API_BASE_URL}/training-programs?${queryParams}`
        : `${API_BASE_URL}/training-programs`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch training programs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching training programs:', error);
      throw error;
    }
  }

  static async createTrainingProgram(trainingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });
      
      if (!response.ok) throw new Error('Failed to create training program');
      return await response.json();
    } catch (error) {
      console.error('Error creating training program:', error);
      throw error;
    }
  }

  static async updateTrainingProgram(id, trainingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });
      
      if (!response.ok) throw new Error('Failed to update training program');
      return await response.json();
    } catch (error) {
      console.error('Error updating training program:', error);
      throw error;
    }
  }

  static async deleteTrainingProgram(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete training program');
      return await response.json();
    } catch (error) {
      console.error('Error deleting training program:', error);
      throw error;
    }
  }

  // Articles API
  static async getArticles(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams 
        ? `${API_BASE_URL}/articles?${queryParams}`
        : `${API_BASE_URL}/articles`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  static async createArticle(articleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) throw new Error('Failed to create article');
      return await response.json();
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async updateArticle(id, articleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) throw new Error('Failed to update article');
      return await response.json();
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  static async deleteArticle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete article');
      return await response.json();
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
}

// Authentication utilities
export class AuthClient {
  static async login(username, password) {
    // In a real implementation, this would call an auth API endpoint
    // For now, we'll simulate the login process
    try {
      // This is a placeholder - in reality, you would call your auth API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}