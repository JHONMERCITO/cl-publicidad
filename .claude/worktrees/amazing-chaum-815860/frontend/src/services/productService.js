import api from './api';

export const productService = {
  // Servicios básicos (antes productos)
  getProducts: (params) => api.get('/products', { params }),
  
  getProduct: (id) => api.get(`/products/${id}`),
  
  createProduct: (serviceData) => api.post('/products', serviceData),
  
  updateProduct: (id, serviceData) => api.put(`/products/${id}`, serviceData),
  
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Nuevos endpoints para servicios
  getActiveServices: () => api.get('/products/active/services'),
  
  getCommonServices: () => api.get('/products/common/services'),
  
  createCommonServices: () => api.post('/products/create-common'),
  
  // Métodos obsoletos removidos:
  // - getLowStockProducts: No aplica para servicios
  // - adjustStock: No aplica para servicios
  
  // Método helper para obtener servicios para dropdown
  getServicesForDropdown: async () => {
    try {
      const response = await api.get('/products/active/services');
      return response.data.map(service => ({
        id: service.id,
        value: service.name,
        label: service.display_name || service.name,
        description: service.description,
        category: service.category,
        service_type: service.service_type,
      }));
    } catch (error) {
      throw error;
    }
  },
};
