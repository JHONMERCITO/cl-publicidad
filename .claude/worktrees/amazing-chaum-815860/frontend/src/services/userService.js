import api from './api';

export const userService = {
  // Obtener todos los usuarios
  getUsers: (params) => api.get('/users', { params }),
  
  // Obtener un usuario específico
  getUser: (id) => api.get(`/users/${id}`),
  
  // Crear nuevo usuario
  createUser: (userData) => api.post('/users', userData),
  
  // Actualizar usuario existente
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Eliminar usuario
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Cambiar contraseña
  changePassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  
  // Activar/desactivar usuario
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
};
