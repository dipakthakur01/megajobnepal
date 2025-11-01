// Database service export for the application
// This file provides a unified interface for database operations

// For development, we'll use the browser-compatible database service
// In production, this would be replaced with the backend PostgreSQL service

import { browserDBService } from './browser-db';
import { apiClient } from '../lib/api-client';

// Export the database service with a consistent interface
export const dbService: any = browserDBService as any;

// Switch to API-backed methods for site info/content when enabled
const useApi = (import.meta as any)?.env?.VITE_USE_API === 'true';
if (useApi) {
  dbService.getAboutInfo = async () => {
    const res = await apiClient.getAboutInfo();
    return res.about;
  };
  dbService.saveAboutInfo = async (about: any) => {
    const res = await apiClient.updateAboutInfo(about);
    return res.about;
  };
  dbService.getTeamMembers = async () => {
    const res = await apiClient.getTeamMembers();
    return res.members;
  };
  dbService.saveTeamMembers = async (members: any[]) => {
    const res = await apiClient.saveTeamMembers(members);
    return res.members;
  };
  dbService.getBlogs = async (params: any = {}) => {
    const res = await apiClient.getBlogs(params);
    return res.blogs;
  };
  dbService.saveBlogs = async (blogs: any[]) => {
    const res = await apiClient.saveBlogs(blogs);
    return res.blogs;
  };
  dbService.getNews = async (params: any = {}) => {
    const res = await apiClient.getNews(params);
    return res.news;
  };
  dbService.saveNews = async (news: any[]) => {
    const res = await apiClient.saveNews(news);
    return res.news;
  };
}

// Re-export types for convenience
export type { User, Company, Job, JobCategory, Application } from '../lib/postgresql-types';