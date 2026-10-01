import api from './api';

export const settingsService = {
  getAll: () => api.get('/settings').then(r => r.data),

  updateCompany:       (data) => api.put('/settings/company', data).then(r => r.data),
  updateReceipts:      (data) => api.put('/settings/receipts', data).then(r => r.data),
  updateNotifications: (data) => api.put('/settings/notifications', data).then(r => r.data),
  updateSecurity:      (data) => api.put('/settings/security', data).then(r => r.data),

  updateProfile: (data) => api.put('/profile', data).then(r => r.data),

  // Compatibilidad con código existente
  getCurrency: () => Promise.resolve({ currency: 'BOB', symbol: 'Bs' }),
};

export default settingsService;
