import React, { useState, useEffect } from 'react';
import { receiptService } from '../../services/receiptService';
import { 
  formatCurrency, 
  formatDateTime, 
  formatPaymentType, 
  formatPaymentMethod,
  calculatePaymentProgress,
  getPaymentStatusColor,
  formatPaymentStatus
} from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const PaymentManager = ({ receipt, onPaymentAdded, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'pago_final',
    payment_method: 'efectivo',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [receipt.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await receiptService.getReceiptPayments(receipt.id);
      setPayments(response.data.data.payments || []);
    } catch (error) {
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentForm.amount);
    const remainingAmount = receipt.total - receipt.paid_amount;
    
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    if (amount > remainingAmount) {
      toast.error(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingAmount)})`);
      return;
    }

    try {
      setSubmitting(true);
      await receiptService.addPayment(receipt.id, {
        ...paymentForm,
        amount: amount
      });
      
      toast.success('Pago registrado correctamente');
      setPaymentForm({
        amount: '',
        type: 'pago_final',
        payment_method: 'efectivo',
        notes: ''
      });
      setShowAddPayment(false);
      fetchPayments();
      onPaymentAdded && onPaymentAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingAmount = receipt.total - receipt.paid_amount;
  const progress = calculatePaymentProgress(receipt.paid_amount, receipt.total);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del recibo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recibo {receipt.receipt_number}
            </h3>
            <p className="text-sm text-gray-600">{receipt.customer_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(receipt.payment_status)}`}>
            {formatPaymentStatus(receipt.payment_status)}
          </span>
        </div>

        {/* Progreso de pago */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso de pago</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Pagado: {formatCurrency(receipt.paid_amount)}</span>
            <span>Pendiente: {formatCurrency(remainingAmount)}</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold">Total: {formatCurrency(receipt.total)}</span>
          </div>
        </div>
      </div>

      {/* Lista de pagos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">
            Historial de Pagos ({payments.length})
          </h4>
          {remainingAmount > 0 && (
            <button
              onClick={() => setShowAddPayment(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Agregar Pago
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      payment.type === 'anticipo' ? 'bg-blue-100' : 
                      payment.type === 'pago_final' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {payment.type === 'anticipo' ? (
                        <ClockIcon className={`h-4 w-4 ${
                          payment.type === 'anticipo' ? 'text-blue-600' : 
                          payment.type === 'pago_final' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      ) : (
                        <CheckCircleIcon className={`h-4 w-4 ${
                          payment.type === 'anticipo' ? 'text-blue-600' : 
                          payment.type === 'pago_final' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        <span className="text-sm text-gray-500">-</span>
                        <span className="text-sm font-medium">{formatPaymentType(payment.type)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPaymentMethod(payment.payment_method)} • {formatDateTime(payment.paid_at)}
                      </div>
                      {payment.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          <em>"{payment.notes}"</em>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario para agregar pago */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Pago</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo: {formatCurrency(remainingAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pago *
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="anticipo">Anticipo</option>
                  <option value="pago_final">Pago Final</option>
                  <option value="abono">Abono</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  rows="3"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Agregar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botón cerrar */}
      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
