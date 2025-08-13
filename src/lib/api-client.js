/**
 * API Client for MongoDB backend
 * This replaces localStorage operations with API calls
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api';

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

  static async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
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
        
        if (!response.ok) {
          // Try to parse the error response from the server
          let errorMessage = 'Failed to create user';
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If we can't parse the error response, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return await response.json();
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

  static async updateUser(id, userData) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          // Try to parse the error response from the server
          let errorMessage = 'Failed to update user';
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If we can't parse the error response, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return await response.json();
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    }

  static async deleteUser(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          // Try to parse the error response from the server
          let errorMessage = 'Failed to delete user';
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If we can't parse the error response, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return await response.json();
      } catch (error) {
        console.error('Error deleting user:', error);
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Login failed with status ${response.status}`);
        } catch (parseError) {
          // If we can't parse JSON, use status text
          throw new Error(`Login failed: ${response.statusText} (${response.status})`);
        }
      }
      
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
      
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Registration failed with status ${response.status}`);
        } catch (parseError) {
          // If we can't parse JSON, use status text
          throw new Error(`Registration failed: ${response.statusText} (${response.status})`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}