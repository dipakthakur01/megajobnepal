import { apiClient as api } from './api';

// Blog service: CRUD operations against backend '/blogs' endpoints
export const blogService = {
  // List blogs (optionally with query params via object)
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length) {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    const res = await api.get(`/blogs${qs ? `?${qs}` : ''}`);
    // Some APIs return {data}, others return array directly
    return Array.isArray(res) ? res : (res.data || res.blogs || res.items || []);
  },

  get: async (id) => {
    if (!id) throw new Error('blogService.get: id is required');
    return await api.get(`/blogs/${id}`);
  },

  create: async (payload) => {
    // Expect: { title, slug, excerpt, content, cover_image_url, published }
    const res = await api.post('/blogs', payload);
    return res;
  },

  update: async (id, payload) => {
    if (!id) throw new Error('blogService.update: id is required');
    const res = await api.put(`/blogs/${id}`, payload);
    return res;
  },

  remove: async (id) => {
    if (!id) throw new Error('blogService.remove: id is required');
    const res = await api.delete(`/blogs/${id}`);
    return res;
  }
};