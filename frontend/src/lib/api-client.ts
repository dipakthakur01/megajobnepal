// API Client for MegaJobNepal Backend
// This handles communication between the frontend and the MongoDB backend server

import { safeStorage } from './safe-storage';
import { dbService } from '../services/db-service';

// Resolve API base URL with sensible fallbacks:
// 1) Use VITE_API_URL if provided
// 2) If running in browser and not localhost, use same-origin '/api' to avoid CORS
// 3) Fallback to common local dev ports
function resolveBaseURL(): string {
  const envUrl = import.meta.env?.VITE_API_URL as string | undefined;

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

  // Browser-origin fallback to avoid CORS in production-like environments
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

console.log('🔍 API Client Debug - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 API Client Debug - Resolved API_BASE_URL:', API_BASE_URL);

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  // Token discovery across common keys and storages
  private getAnyTokenFromStorage(): string | null {
    try {
      const keys = [
        'megajobnepal_auth_token',
        'auth_token',
        'access_token',
        'token'
      ];
      for (const k of keys) {
        const v = safeStorage.getItem(k);
        if (v) return v;
      }
      // Fallback direct access if safeStorage is constrained
      if (typeof window !== 'undefined') {
        for (const k of keys) {
          const v1 = window.localStorage?.getItem(k);
          if (v1) return v1;
          const v2 = window.sessionStorage?.getItem(k);
          if (v2) return v2;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private loadTokenFromStorage() {
    try {
      const token = this.getAnyTokenFromStorage();
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.warn('Could not load token from storage:', error);
    }
  }

  private saveTokenToStorage(token: string) {
    try {
      safeStorage.setItem('megajobnepal_auth_token', token);
      this.token = token;
    } catch (error) {
      console.warn('Could not save token to storage:', error);
    }
  }

  private removeTokenFromStorage() {
    try {
      safeStorage.removeItem('megajobnepal_auth_token');
      this.token = null;
    } catch (error) {
      console.warn('Could not remove token from storage:', error);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Refresh token from storage to ensure latest value after login
    try {
      const latestToken = this.getAnyTokenFromStorage();
      if (latestToken && latestToken !== this.token) {
        this.token = latestToken;
      }
    } catch {}
    
    const defaultHeaders: HeadersInit = {};

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
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
        const message = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        const err: any = new Error(message);
        err.status = response.status;
        err.code = response.status;
        err.data = errorData;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      // Give clearer guidance for network/CORS issues commonly seen as "Failed to fetch"
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('TypeError')) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown origin';
        const netErr: any = new Error(
          `Network error: could not reach ${url}. Ensure backend is running and CORS allows ${origin}. Base URL: ${this.baseURL}`
        );
        netErr.status = 0;
        throw netErr;
      }
      throw error;
    }
  }

  // Authentication methods
  // REMOVED: register method bypassed OTP verification
  // Use sendOTP + completeSignup flow instead
  /*
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    userType: 'job_seeker' | 'employer';
    phone?: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.saveTokenToStorage(response.token);
    }

    return response;
  }
  */

  async login(credentials: { email: string; password: string }) {
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

  async sendOTP(email: string) {
    const response = await this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  }

  async verifyOTP(email: string, enteredOtp: string) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: enteredOtp }),
    });
    return response;
  }

  async completeSignup(userData: {
    email: string;
    password: string;
    user_type: string;
    full_name: string;
    otp: string;
    phone_number?: string;
    company_data?: {
      name: string;
      description: string;
      website?: string;
      location: string;
      industry: string;
      size: string;
      founded_year?: number;
      employer_job_title?: string;
      employer_department?: string;
    };
  }) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.saveTokenToStorage(response.token);
    }
    return response;
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(profileData: any) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getJobs(params: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    type?: string;
    search?: string;
    status?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    try {
      return await this.request(endpoint);
    } catch (err) {
      console.warn('getJobs failed, falling back to local data:', err);
      // Fallback to local storage DB to keep UI functional in dev
      const skip = (Number(page) - 1) * Number(limit);
      const filter: any = {};
      if (params.status) filter.status = params.status; else filter.status = 'active';
      if (params.category) filter.category_id = params.category;
      if (params.company_id) filter.company_id = params.company_id as any;
      // Note: browser DB filter is exact match; we cannot do regex here
      const jobs = await dbService.getJobs(filter, Number(limit), Number(skip));
      return {
        jobs,
        pagination: {
          current_page: Number(page),
          total_pages: 1,
          total_jobs: jobs.length,
          per_page: Number(limit)
        }
      };
    }
  }

  async getJob(id: string) {
    return await this.request(`/jobs/${id}`);
  }

  async createJob(jobData: any) {
    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Companies methods
  async getCompanies(params: {
    page?: number;
    limit?: number;
    featured?: boolean;
    topHiring?: boolean;
    search?: string;
    industry?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/companies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    try {
      return await this.request(endpoint);
    } catch (err) {
      console.warn('getCompanies failed, falling back to local data:', err);
      // Fallback to local storage DB
      const companies = await dbService.getCompanies({});
      const start = (Number(page) - 1) * Number(limit);
      const paged = companies.slice(start, start + Number(limit));
      return {
        companies: paged,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(companies.length / Number(limit)) || 1,
          total_companies: companies.length,
          per_page: Number(limit)
        }
      };
    }
  }

  async getCompanyById(id: string) {
    return await this.request(`/companies/${id}`);
  }

  async getCompanyByName(name: string) {
    return await this.request(`/companies/by-name/${encodeURIComponent(name)}`);
  }

  // Applications methods
  async applyForJob(applicationData: {
    jobId: string;
    coverLetter?: string;
    resumeUrl?: string;
  }) {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplications() {
    return await this.request('/applications');
  }

  // Recruitment methods
  async getRecruitmentItems() {
    return await this.request('/recruitment');
  }

  async createRecruitmentItem(payload: any) {
    return await this.request('/recruitment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Contact methods
  async sendContactMessage(payload: {
    name: string;
    email: string;
    subject: string;
    category?: string;
    message: string;
  }) {
    return await this.request('/contact/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateRecruitmentItem(id: string, payload: any) {
    return await this.request(`/recruitment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteRecruitmentItem(id: string) {
    // Some backends return 204 with no body; handle gracefully
    try {
      const res = await fetch(`${this.baseURL}/recruitment/${id}`, {
        method: 'DELETE',
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.error || errorData.message || `HTTP ${res.status}`;
        throw new Error(message);
      }
      return { success: true };
    } catch (err) {
      throw err;
    }
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
      // Use the proxied status endpoint to ensure consistent behavior in dev and production
      const response = await fetch(`${this.baseURL}/status`);
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
  async isBackendAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'OK' || health.status === 'Connected' || health.status === 'Degraded';
    } catch (error) {
      console.warn('Backend is not available, falling back to localStorage mode');
      return false;
    }
  }

  // File upload methods
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('profileImage', file);

    return await this.request('/users/profile/image', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);

    return await this.request('/users/profile/resume', {
      method: 'POST',
      body: formData,
    });
  }

  // Get current authentication status
  isAuthenticated(): boolean {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
  
  // Upload hero image for homepage section
  async uploadHomepageHeroImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return await this.request('/site/sections/homepage_hero/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  // Generic: upload image for any site section (e.g., site_info logos)
  async uploadSectionImage(section: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    // Backend route accepts /site/sections/:section/upload-image
    return await this.request(`/site/sections/${section}/upload-image`, {
      method: 'POST',
      body: formData,
    });
  }

  // Testimonials API
  async getTestimonials() {
    return await this.request('/testimonials', { method: 'GET' });
  }

  async createTestimonial(payload: { name: string; text: string; role?: string; company?: string; avatar_url?: string; }) {
    return await this.request('/testimonials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTestimonial(id: string, payload: { name: string; text: string; role?: string; company?: string; avatar_url?: string; }) {
    return await this.request(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteTestimonial(id: string) {
    return await this.request(`/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadTestimonialAvatar(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return await this.request(`/testimonials/${id}/upload-avatar`, {
      method: 'POST',
      body: formData,
    });
  }

  async uploadTeamMemberImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return await this.request('/site-info/team-members/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  getToken(): string | null {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      return token || this.token;
    } catch (error) {
      return this.token;
    }
  }

  async sendPasswordChangeOtp(email: string) {
    return await this.request('/auth/send-password-change-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePasswordWithOtp(email: string, otp: string, newPassword: string) {
    return await this.request('/auth/change-password-with-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  // Admin: change own password without OTP (requires Authorization token)
  async adminChangePassword(payload: { currentPassword: string; newPassword: string }) {
    return await this.request('/admin/password/change', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAdminUsers(params: { page?: number; limit?: number; q?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    // Use dedicated staff-only endpoint
    return await this.request(`/admin/admin-users${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
  }

  // Get all users (system-wide) for Super Admin overview
  async getAllUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await this.request(endpoint);
    return Array.isArray((res as any)?.users) ? (res as any) : { users: Array.isArray(res) ? (res as any) : [], pagination: (res as any)?.pagination };
  }

  async createAdminUser(payload: { email: string; password: string; full_name?: string; role?: 'admin' | 'hr' | 'super_admin' }) {
    // Super admin creates staff accounts
    return await this.request('/admin/admin-users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAdminUser(id: string, payload: { email?: string; name?: string }) {
    // Support PATCH for compatibility
    return await this.request(`/admin/admin-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminUser(id: string) {
    return await this.request(`/admin/admin-users/${id}`, { method: 'DELETE' });
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    return await this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateUserRole(id: string, role: 'admin' | 'hr' | 'super_admin') {
    return await this.request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Permissions catalog and user permissions management
  async getPermissionsCatalog() {
    return await this.request('/admin/permissions', { method: 'GET' });
  }

  async getUserPermissions(id: string) {
    return await this.request(`/admin/admin-users/${id}/permissions`, { method: 'GET' });
  }

  async updateUserPermissions(id: string, permissions: string[]) {
    return await this.request(`/admin/admin-users/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });
  }

  async resetUserPassword(id: string, newPassword: string) {
    return await this.request(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async moderateJob(id: string, action: 'approve' | 'reject', reason?: string) {
    return await this.request(`/admin/jobs/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason }),
    });
  }

  async createJobByAdmin(payload: any) {
    return await this.request('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateJobByAdmin(id: string, payload: any) {
    return await this.request(`/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteJobByAdmin(id: string) {
    return await this.request(`/admin/jobs/${id}`, { method: 'DELETE' });
  }

  // Site info (About + Team)
  async getAboutInfo() {
    return await this.request('/site-info/about');
  }

  async updateAboutInfo(payload: any) {
    return await this.request('/site-info/about', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getTeamMembers() {
    return await this.request('/site-info/team-members');
  }

  async saveTeamMembers(members: any[]) {
    return await this.request('/site-info/team-members', {
      method: 'PUT',
      body: JSON.stringify({ members }),
    });
  }

  // Content (Blogs + News)
  async getBlogs(params: { status?: string; search?: string; category?: string; page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/content/blogs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request(endpoint);
  }

  async saveBlogs(blogs: any[]) {
    return await this.request('/content/blogs', {
      method: 'PUT',
      body: JSON.stringify({ blogs }),
    });
  }

  async getNews(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/content/news${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request(endpoint);
  }

  async saveNews(news: any[]) {
    return await this.request('/content/news', {
      method: 'PUT',
      body: JSON.stringify({ news }),
    });
  }

  // Site sections (general settings like site_info, trusted_companies)
  async getSectionSettings(section: string) {
    return await this.request(`/site/sections/${section}`);
  }

  async saveSectionSettings(section: string, config: any, published: boolean = true) {
    return await this.request(`/site/sections/${section}`, {
      method: 'PUT',
      body: JSON.stringify({ config, published }),
    });
  }

  // Employers
  async getEmployers(params: { page?: number; limit?: number; search?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/employers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request(endpoint);
  }

  async getEmployerById(id: string) {
    return await this.request(`/employers/${id}`);
  }

  async createEmployer(payload: any) {
    return await this.request('/employers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEmployer(id: string, payload: any) {
    return await this.request(`/employers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteEmployer(id: string) {
    return await this.request(`/employers/${id}`, { method: 'DELETE' });
  }

  // Employer self-service profile
  async getEmployerProfile() {
    return await this.request('/employers/profile');
  }

  async updateEmployerProfile(payload: any) {
    return await this.request('/employers/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async uploadEmployerLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    return await this.request('/employers/upload-logo', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadEmployerBanner(file: File) {
    const formData = new FormData();
    formData.append('banner', file);
    return await this.request('/employers/upload-banner', {
      method: 'POST',
      body: formData,
    });
  }

  async getEmployerSubscription() {
    return await this.request('/employers/subscription');
  }

  async upgradeEmployerSubscription(payload: any) {
    return await this.request('/employers/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Payments & Subscriptions (admin)
  async getPayments(params: { status?: string; page?: number; limit?: number; q?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/admin/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    try {
      const res = await this.request(endpoint);
      return Array.isArray((res as any)?.payments) ? (res as any).payments : (Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.warn('getPayments fallback due to error:', err?.message || err);
      // Fallback to empty list until backend is ready
      return [];
    }
  }

  async updatePaymentStatus(id: string, status: 'pending' | 'completed' | 'failed' | 'refunded') {
    try {
      const res = await this.request(`/admin/payments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return (res as any)?.payment ?? res;
    } catch (err) {
      console.warn('updatePaymentStatus failed:', err);
      throw err;
    }
  }

  async refundPayment(id: string) {
    try {
      const res = await this.request(`/admin/payments/${id}/refund`, { method: 'POST' });
      return (res as any)?.payment ?? res;
    } catch (err) {
      console.warn('refundPayment failed:', err);
      throw err;
    }
  }

  async getSubscriptions(params: { status?: string; page?: number; limit?: number; q?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/admin/subscriptions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    try {
      const res = await this.request(endpoint);
      return Array.isArray((res as any)?.subscriptions) ? (res as any).subscriptions : (Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.warn('getSubscriptions fallback due to error:', err?.message || err);
      // Fallback: use employer subscription if available, else none
      try {
        const sub = await this.getEmployerSubscription();
        return sub ? [sub] : [];
      } catch {
        return [];
      }
    }
  }

  // Admin Companies
  async getAdminCompanies(params: { page?: number; limit?: number; search?: string; status?: string; verified?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/admin/companies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    try {
      const res = await this.request(endpoint);
      return Array.isArray((res as any)?.companies) ? (res as any).companies : (Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.warn('getAdminCompanies failed:', err?.message || err);
      throw err;
    }
  }

  async createCompanyByAdmin(payload: any) {
    try {
      const res = await this.request('/admin/companies', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res as any)?.company ?? res;
    } catch (err) {
      console.warn('createCompanyByAdmin failed:', err);
      throw err;
    }
  }

  async updateCompanyByAdmin(id: string, payload: any) {
    try {
      const res = await this.request(`/admin/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return (res as any)?.company ?? res;
    } catch (err) {
      console.warn('updateCompanyByAdmin failed:', err);
      throw err;
    }
  }

  async deleteCompanyByAdmin(id: string, options: { force?: boolean } = {}) {
    const query = options.force ? '?force=true' : '';
    try {
      const res = await this.request(`/admin/companies/${id}${query}`, { method: 'DELETE' });
      return res;
    } catch (err) {
      console.warn('deleteCompanyByAdmin failed:', err);
      throw err;
    }
  }

  async approveCompanyByAdmin(id: string) {
    try {
      const res = await this.request(`/admin/companies/${id}/approve`, { method: 'POST' });
      return (res as any)?.company ?? res;
    } catch (err) {
      console.warn('approveCompanyByAdmin failed:', err);
      throw err;
    }
  }

  async uploadCompanyLogoByAdmin(id: string, file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const res = await this.request(`/admin/companies/${id}/upload-logo`, {
        method: 'POST',
        body: formData,
      });
      return (res as any)?.company ?? res;
    } catch (err) {
      console.warn('uploadCompanyLogoByAdmin failed:', err);
      throw err;
    }
  }

  // NEW: Reset endpoints
  async resetCompanies(mode: 'all' | 'sample' = 'all') {
    try {
      const res = await this.request(`/admin/companies/reset?mode=${mode}`, { method: 'DELETE' });
      return res;
    } catch (err) {
      console.warn('resetCompanies failed:', err);
      throw err;
    }
  }

  async resetEmployers() {
    try {
      const res = await this.request('/admin/employers/reset', { method: 'DELETE' });
      return res;
    } catch (err) {
      console.warn('resetEmployers failed:', err);
      throw err;
    }
  }
  // Admin Jobs - listing for dashboard
  async getAdminJobs(params: { page?: number; limit?: number; status?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const endpoint = `/admin/jobs/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await this.request(endpoint);
    const jobs = Array.isArray(res?.jobs)
      ? res.jobs
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
    return { jobs, pagination: res?.pagination };
  }

  // Admin dashboard statistics
  async getAdminDashboardStats() {
    // Returns { totalUsers, activeUsers, totalStaff, activeStaff, totalJobs, totalCompanies, totalApplications, recentJobs, recentApplications }
    return await this.request('/admin/dashboard/stats');
  }

  // Admin job statistics
  async getAdminJobStats() {
    // Returns { success, data: { total, pending, approved, rejected, by_tier: { megajob, premium, prime, newspaper } } }
    return await this.request('/admin/jobs/stats');
  }

  // Admin job approval management
  async approveAdminJob(id: string, tier: 'megajob' | 'premium' | 'prime' | 'newspaper', notes?: string) {
    return await this.request(`/admin/jobs/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ tier, notes }),
    });
  }

  async rejectAdminJob(id: string, reason: string) {
    return await this.request(`/admin/jobs/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async updateAdminJobTier(id: string, tier: 'megajob' | 'premium' | 'prime' | 'newspaper') {
    return await this.request(`/admin/jobs/${id}/tier`, {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  }

  // Upload job cover image (admin)
  async uploadAdminJobCover(id: string, file: File) {
    const formData = new FormData();
    formData.append('cover', file);
    return await this.request(`/admin/jobs/${id}/upload-cover`, {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new APIClient();
export default APIClient;
