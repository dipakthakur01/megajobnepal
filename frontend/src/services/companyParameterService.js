import { apiClient as api } from './api';

// Service to manage company parameters (industry, company type)
// Endpoints: /api/company-parameters/:type
const companyParameterService = {
  async list(type) {
    const res = await api.get(`/company-parameters/${type}`);
    // API client returns parsed JSON; normalize to array of items
    return res.items || res;
  },
  async create(type, data) {
    return await api.post(`/company-parameters/${type}`, data);
  },
  async update(type, id, data) {
    return await api.put(`/company-parameters/${type}/${id}`, data);
  },
  async remove(type, id) {
    return await api.delete(`/company-parameters/${type}/${id}`);
  },
};

export default companyParameterService;