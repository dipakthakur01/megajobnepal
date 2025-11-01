// API Client for MegaJobNepal Backend
// This handles communication between the frontend and the MongoDB backend server

import { safeStorage } from './safe-storage';

// Resolve API base URL with sensible fallbacks:
// 1) Use VITE_API_URL if provided
// 2) If running in browser and not localhost, use same-origin '/api' to avoid CORS
// 3) Fallback to common local dev ports
function resolveBaseURL() {
  const envUrl = import.meta.env?.VITE_API_URL;

  // Prefer Vite proxy in local development to avoid CORS or mixed-content issues
  const isBrowser = typeof window !== 'undefined' && !!window.location?.origin;
  const origin = isBrowser ? window.location.origin : '';
  const isLocalDev = !!(import.meta.env?.DEV) && /localhost|127\.0\.0\.1/i.test(origin);

  if (isLocalDev) {
    // Always use relative '/api' so requests are proxied by Vite dev server
    return '/api';
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl;
  }

  if (isBrowser) {
    const isLocal = /localhost|127\.0\.0\.1/i.test(origin);
    if (!isLocal) {
      return `${origin}/api`;
    }
  }

  // Local development default
  return '/api';
}

const API_BASE_URL = resolveBaseURL();

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = null;
    this.loadTokenFromStorage();
  }

  loadTokenFromStorage() {
    try {
      this.token = safeStorage.getItem('megajobnepal_auth_token');
    } catch (error) {
      console.warn('Could not load token from storage:', error);
    }
  }

  saveTokenToStorage(token) {
    try {
      safeStorage.setItem('megajobnepal_auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Could not save token to storage:', error);
    }
  }

  removeTokenFromStorage() {
    try {
      safeStorage.removeItem('megajobnepal_auth_token');
      this.token = null;
    } catch (error) {
      console.warn('Could not remove token from storage:', error);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Refresh token from storage to avoid stale instance token after login
    try {
      const latestToken = safeStorage.getItem('megajobnepal_auth_token');
      if (latestToken && latestToken !== this.token) {
        this.token = latestToken;
      }
    } catch {}
    
    // Only set JSON content-type when sending JSON. For FormData or other payloads,
    // let the browser set appropriate headers automatically.
    const isFormData = options && options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }
  
  // HTTP method shortcuts
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.saveTokenToStorage(response.token);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.saveTokenToStorage(response.token);
    }

    return response;
  }

  logout() {
    this.removeTokenFromStorage();
  }

  // OTP-based signup flow
  async sendOTP(email) {
    return await this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email, enteredOtp) {
    return await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: enteredOtp }),
    });
  }

  async completeSignup(userData) {
    return await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Jobs methods
  async getJobs(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request(endpoint);
  }

  async getJob(id) {
    return await this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Companies methods
  async getCompanies(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/companies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request(endpoint);
  }

  // Applications methods
  async applyForJob(applicationData) {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplications() {
    return await this.request('/applications');
  }

  // Health and status methods
  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Backend status check failed:', error);
      return { status: 'Disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: 'Error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      const health = await this.checkHealth();
      return health.status === 'OK';
    } catch (error) {
      console.warn('Backend is not available, falling back to localStorage mode');
      return false;
    }
  }

  // Removed duplicate generic HTTP methods. Use the HTTP shortcuts above
  // (get(endpoint, options), post(endpoint, data, options), put(endpoint, data, options),
  // patch(endpoint, data, options), delete(endpoint, options)).

  // Get current authentication status
  isAuthenticated() {
    try {
      const token = this.token || safeStorage.getItem('megajobnepal_auth_token');
      return !!token;
    } catch {
      return !!this.token;
    }
  }

  getToken() {
    try {
      return this.token || safeStorage.getItem('megajobnepal_auth_token');
    } catch {
      return this.token;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

// Export the class for testing or custom instances
export default APIClient;
