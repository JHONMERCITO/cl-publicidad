import api from './api';

export const paymentService = {
  // Obtener pagos de un recibo específico
  getReceiptPayments: (receiptId) => api.get(`/receipts/${receiptId}/payments`),
  
  // Agregar un pago a un recibo
  addPayment: (receiptId, paymentData) => api.post(`/receipts/${receiptId}/payments`, paymentData),
  
  // Actualizar un pago (solo admin)
  updatePayment: (paymentId, paymentData) => api.put(`/payments/${paymentId}`, paymentData),
  
  // Eliminar un pago (solo admin)
  deletePayment: (paymentId) => api.delete(`/payments/${paymentId}`),
  
  // Reporte de pagos por período
  getPaymentsReport: (params) => api.get('/reports/payments', { params }),
  
  // Constantes para tipos de pago y métodos
  PAYMENT_TYPES: {
    ANTICIPO: 'anticipo',
    PAGO_FINAL: 'pago_final',
    ABONO: 'abono'
  },
  
  PAYMENT_METHODS: {
    EFECTIVO: 'efectivo',
    TRANSFERENCIA: 'transferencia',
    TARJETA: 'tarjeta',
    CHEQUE: 'cheque'
  },
  
  // Formatear tipo de pago para mostrar
  formatPaymentType: (type) => {
    const types = {
      'anticipo': 'Anticipo',
      'pago_final': 'Pago Final',
      'abono': 'Abono'
    };
    return types[type] || type;
  },
  
  // Formatear método de pago para mostrar
  formatPaymentMethod: (method) => {
    const methods = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta': 'Tarjeta',
      'cheque': 'Cheque'
    };
    return methods[method] || method;
  }
};
