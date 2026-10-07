import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  try { localStorage.setItem('auth_token', token); } catch (_) {}
};

export const clearAuthToken = () => {
  authToken = null;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch (_) {}
};

export const getStoredToken = () => {
  try { return localStorage.getItem('auth_token'); } catch (_) { return null; }
};

export const setStoredUser = (user) => {
  try { localStorage.setItem('auth_user', JSON.stringify(user)); } catch (_) {}
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('auth_user');
    return u ? JSON.parse(u) : null;
  } catch (_) { return null; }
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export default api;
