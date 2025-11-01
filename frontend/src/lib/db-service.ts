// Database service export for the application
// This file provides a unified interface for database operations

// For development, we'll use the browser-compatible database service
// In production, this would be replaced with the backend PostgreSQL service

import { browserDBService } from '../services/browser-db';
import { apiClient } from './api-client';

// Export the database service with a consistent interface
export const dbService: any = browserDBService as any;

// Always use backend API for site content and sections
// These methods ensure About, Team, Blogs, and News are persisted in the backend
// regardless of any local dev flags.
dbService.getAboutInfo = async () => {
  const res = await apiClient.getAboutInfo();
  return (res as any)?.about ?? res;
};

dbService.saveAboutInfo = async (about: any) => {
  const res = await apiClient.updateAboutInfo(about);
  return (res as any)?.about ?? res;
};

dbService.getTeamMembers = async () => {
  const res = await apiClient.getTeamMembers();
  return (res as any)?.members ?? res;
};

dbService.saveTeamMembers = async (members: any[]) => {
  const res = await apiClient.saveTeamMembers(members);
  return (res as any)?.members ?? res;
};

dbService.getBlogs = async (params: any = {}) => {
  const res = await apiClient.getBlogs(params);
  return (res as any)?.blogs ?? res;
};

dbService.saveBlogs = async (blogs: any[]) => {
  const res = await apiClient.saveBlogs(blogs);
  return (res as any)?.blogs ?? res;
};

dbService.getNews = async (params: any = {}) => {
  const res = await apiClient.getNews(params);
  return (res as any)?.news ?? res;
};

dbService.saveNews = async (news: any[]) => {
  const res = await apiClient.saveNews(news);
  return (res as any)?.news ?? res;
};

// Re-export types for convenience
export type { User, Company, Job, JobCategory, Application } from './postgresql-types';