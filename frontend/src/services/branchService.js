import api from './api';

const branchService = {
  getAll: ()                    => api.get('/branches'),
  create: (data)                => api.post('/branches', data),
  update: (id, data)            => api.put(`/branches/${id}`, data),
  delete: (id)                  => api.delete(`/branches/${id}`),
  getStats: (id)                => api.get(`/branches/${id}/stats`),
};

export default branchService;
