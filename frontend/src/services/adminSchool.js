import api from '../lib/api.js';

export const AdminSchoolService = {
  getSchools: () => api.get('/admin/schools'),
  createSchool: (data) => api.post('/admin/schools', data),
  toggleStatus: (id, isActive) => api.patch(`/admin/schools/${id}/status`, { isActive }),
  getAuditLogs: (limit = 30) => api.get('/admin/audit-logs', { params: { limit } }),
  changePassword: (data) => api.post('/admin/change-password', data),
  login: (credentials) => api.post('/admin/login', credentials),
};
