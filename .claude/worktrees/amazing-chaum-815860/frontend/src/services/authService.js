import api from './api';

export const authService = {
  login: (credentials) => api.post('/login', credentials),
  
  register: (userData) => api.post('/register', userData),
  
  logout: () => api.post('/logout'),
  
  me: () => api.get('/me'),
};
