import api from './api';

export const receiptService = {
  getReceipts: (params) => api.get('/receipts', { params }),
  
  getReceipt: (id) => api.get(`/receipts/${id}`),
  
  createReceipt: (receiptData) => api.post('/receipts', receiptData),
  
  updateReceipt: (id, receiptData) => api.put(`/receipts/${id}`, receiptData),
  
  cancelReceipt: (id) => api.post(`/receipts/${id}/cancel`),
  
  generatePdf: (id) => api.get(`/receipts/${id}/pdf`, { responseType: 'blob' }),

  markAsReady: (id) => api.post(`/receipts/${id}/ready`),
  
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  
  // Métodos para pagos
  getReceiptPayments: (receiptId) => api.get(`/receipts/${receiptId}/payments`),
  
  addPayment: (receiptId, paymentData) => api.post(`/receipts/${receiptId}/payments`, paymentData),
};
