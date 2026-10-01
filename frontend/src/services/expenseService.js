import api from './api';

export const expenseService = {
  getExpenses: (params) => api.get('/expenses', { params }),
  
  getExpense: (id) => api.get(`/expenses/${id}`),
  
  createExpense: (expenseData) => api.post('/expenses', expenseData),
  
  updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  
  getCategories: () => api.get('/expenses/categories'),
  
  getExpensesReport: (params) => api.get('/reports/expenses', { params }),
};
