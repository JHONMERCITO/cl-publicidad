import api from './api';

export const dashboardService = {
  getDashboardData: (params) => api.get('/dashboard', { params }),
  
  getProfitLossReport: (params) => api.get('/reports/profit-loss', { params }),
};
