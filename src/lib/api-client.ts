/**
 * API Client for MongoDB backend
 * Centralized API calls with error handling
 */

// Base URL: use NEXT_PUBLIC_API_URL if available, otherwise relative path (/api)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

// Helper untuk handle response error
async function handleResponse(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const errorData = await res.json();
      if (errorData.error) message = errorData.error;
    } catch {
      // fallback ke status text
    }
    throw new Error(message || "API request failed");
  }
  return res.json();
}

export class ApiClient {
  // ========================= USERS =========================
  static async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(res);
  }

  static async getUserById(id: string) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(res);
  }

  static async createUser(userData: any) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  }

  static async updateUser(id: string, userData: any) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  }

  static async deleteUser(id: string) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  }

  // ========================= LIVESTOCK =========================
  static async getLivestock(filters: Record<string, string> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_BASE_URL}/livestock?${queryParams}`
      : `${API_BASE_URL}/livestock`;
    const res = await fetch(url);
    return handleResponse(res);
  }

  static async createLivestock(livestockData: any) {
    const res = await fetch(`${API_BASE_URL}/livestock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livestockData),
    });
    return handleResponse(res);
  }

  static async updateLivestock(id: string, livestockData: any) {
    const res = await fetch(`${API_BASE_URL}/livestock/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livestockData),
    });
    return handleResponse(res);
  }

  static async deleteLivestock(id: string) {
    const res = await fetch(`${API_BASE_URL}/livestock/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  }

  // ========================= TRAINING PROGRAMS =========================
  static async getTrainingPrograms(filters: Record<string, string> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_BASE_URL}/training-programs?${queryParams}`
      : `${API_BASE_URL}/training-programs`;
    const res = await fetch(url);
    return handleResponse(res);
  }

  static async createTrainingProgram(trainingData: any) {
    const res = await fetch(`${API_BASE_URL}/training-programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainingData),
    });
    return handleResponse(res);
  }

  static async updateTrainingProgram(id: string, trainingData: any) {
    const res = await fetch(`${API_BASE_URL}/training-programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainingData),
    });
    return handleResponse(res);
  }

  static async deleteTrainingProgram(id: string) {
    const res = await fetch(`${API_BASE_URL}/training-programs/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  }

  // ========================= ARTICLES =========================
  static async getArticles(filters: Record<string, string> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_BASE_URL}/articles?${queryParams}`
      : `${API_BASE_URL}/articles`;
    const res = await fetch(url);
    return handleResponse(res);
  }

  static async createArticle(articleData: any) {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });
    return handleResponse(res);
  }

  static async updateArticle(id: string, articleData: any) {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });
    return handleResponse(res);
  }

  static async deleteArticle(id: string) {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  }
}

// ========================= AUTH =========================
export class AuthClient {
  static async login(username: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  }

  static async register(userData: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  }
}
