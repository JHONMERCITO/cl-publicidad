import React, { useState, useEffect, useRef } from 'react';
import { receiptService } from '../services/receiptService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import PaymentManager from '../components/payments/PaymentManager';
import CreateReceiptModal from '../components/CreateReceiptModal';
import { 
  formatDate, 
  formatCurrency, 
  formatReceiptStatus, 
  getReceiptStatusColor, 
  formatPaymentStatus, 
  getPaymentStatusColor,
  calculatePaymentProgress
} from '../utils/formatters';
import {
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    customer: '',
    receipt_number: '',
    date_from: '',
    date_to: '',
  });
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const tableScrollRef = useRef(null);
  const topScrollRef = useRef(null);

  useEffect(() => {
    const tableEl = tableScrollRef.current;
    const stickyEl = topScrollRef.current;
    if (!tableEl || !stickyEl) return;

    const syncWidth = () => {
      if (stickyEl.firstChild) stickyEl.firstChild.style.width = tableEl.scrollWidth + 'px';
    };
    syncWidth();

    const onTable  = () => { stickyEl.scrollLeft = tableEl.scrollLeft; };
    const onSticky = () => { tableEl.scrollLeft = stickyEl.scrollLeft; };

    tableEl.addEventListener('scroll', onTable);
    stickyEl.addEventListener('scroll', onSticky);

    const ro = new ResizeObserver(syncWidth);
    ro.observe(tableEl);

    return () => {
      tableEl.removeEventListener('scroll', onTable);
      stickyEl.removeEventListener('scroll', onSticky);
      ro.disconnect();
    };
  }, [loading]);

  useEffect(() => {
    fetchReceipts();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReceipts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await receiptService.getReceipts({
        ...filters,
        page,
      });
      setReceipts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      });
    } catch (error) {
      toast.error('Error al cargar los recibos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateReceipt = () => {
    setSelectedReceipt(null);
    setShowCreateModal(true);
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const response = await receiptService.getReceipt(receiptId);
      setSelectedReceipt(response.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Error al cargar el recibo');
    }
  };

  const handlePrintReceipt = async (receiptId) => {
    try {
      const response = await receiptService.generatePdf(receiptId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF generado exitosamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
    }
  };

  const handleMarkAsReady = async (receipt) => {
    if (!window.confirm(`¿Marcar "${receipt.customer_name}" como listo para entrega?`)) return;
    try {
      await receiptService.markAsReady(receipt.id);
      toast.success('Marcado como listo para entrega');
      fetchReceipts(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar el estado');
    }
  };

  const handleManagePayments = async (receiptId) => {
    try {
      const response = await receiptService.getReceipt(receiptId);
      setSelectedReceipt(response.data);
      setShowPaymentsModal(true);
    } catch (error) {
      toast.error('Error al cargar el recibo');
    }
  };

  const handleCancelReceipt = async (receipt) => {
    if (window.confirm(`¿Está seguro de cancelar el recibo ${receipt.receipt_number}?`)) {
      try {
        await receiptService.cancelReceipt(receipt.id);
        toast.success('Recibo cancelado exitosamente');
        fetchReceipts(pagination.current_page);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al cancelar el recibo');
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setShowPaymentsModal(false);
    setSelectedReceipt(null);
    fetchReceipts(pagination.current_page);
  };

  const getStatusBadge = (receipt) => {
    const statusColor = getReceiptStatusColor(receipt.status);
    const paymentColor = getPaymentStatusColor(receipt.payment_status);
    
    return (
      <div className="space-y-1">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {formatReceiptStatus(receipt.status)}
        </span>
        {receipt.payment_status && (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentColor}`}>
            {formatPaymentStatus(receipt.payment_status)}
          </span>
        )}
      </div>
    );
  };

  const getProgressBar = (receipt) => {
    const progress = calculatePaymentProgress(receipt.paid_amount || 0, receipt.total);
    let progressColor = 'bg-red-500'; // Sin pago
    
    if (progress >= 100) {
      progressColor = 'bg-green-500'; // Completo
    } else if (progress > 0) {
      progressColor = 'bg-yellow-500'; // Con anticipo
    }
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className={`${progressColor} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  if (loading && receipts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Recibos de Venta
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona cotizaciones, ventas y pagos fraccionados
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={handleCreateReceipt}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado del Trabajo
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="">Todos</option>
              <option value="cotizado">Cotizado</option>
              <option value="con_anticipo">Con Anticipo</option>
              <option value="en_produccion">En Producción</option>
              <option value="listo_entrega">Listo para Entrega</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado de Pago
            </label>
            <select
              value={filters.payment_status}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="">Todos</option>
              <option value="sin_anticipo">Sin Anticipo</option>
              <option value="con_anticipo">Con Anticipo</option>
              <option value="pagado_completo">Pagado Completo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <input
              type="text"
              value={filters.customer}
              onChange={(e) => handleFilterChange('customer', e.target.value)}
              className="mt-1 input-field"
              placeholder="Nombre del cliente..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Recibo
            </label>
            <input
              type="text"
              value={filters.receipt_number}
              onChange={(e) => handleFilterChange('receipt_number', e.target.value)}
              className="mt-1 input-field"
              placeholder="REC-2024-000001..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="mt-1 input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="mt-1 input-field"
            />
          </div>
        </div>
      </div>

      {/* Tabla de recibos */}
      <div className="bg-white shadow sm:rounded-md">
        <div ref={tableScrollRef} className="overflow-x-auto no-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recibo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total / Progreso de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay recibos</h3>
                      <p className="text-gray-500 mb-4">Comienza creando tu primera venta</p>
                      <Button onClick={handleCreateReceipt} size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nueva Venta
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.receipt_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{receipt.customer_name}</div>
                      {receipt.customer_phone && (
                        <div className="text-sm text-gray-500">{receipt.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(receipt.total)}
                      </div>
                      {receipt.paid_amount > 0 && (
                        <div className="text-sm text-green-600">
                          Pagado: {formatCurrency(receipt.paid_amount)}
                        </div>
                      )}
                      {receipt.paid_amount < receipt.total && (
                        <div className="text-sm text-orange-600">
                          Pendiente: {formatCurrency(receipt.total - receipt.paid_amount)}
                        </div>
                      )}
                      {getProgressBar(receipt)}
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(calculatePaymentProgress(receipt.paid_amount || 0, receipt.total))}% pagado
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(receipt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.receipt_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* VER DETALLE */}
                        <button
                          onClick={() => handleViewReceipt(receipt.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="Ver Detalle"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {/* DESCARGAR PDF */}
                        <button
                          onClick={() => handlePrintReceipt(receipt.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="Descargar PDF"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        
                        {/* LISTO PARA ENTREGA */}
                        {!['completado', 'cancelado', 'listo_entrega'].includes(receipt.status) && (
                          <button
                            onClick={() => handleMarkAsReady(receipt)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                            title="Marcar como listo para entrega"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}

                        {/* GESTIONAR PAGOS - Solo si no está completamente pagado */}
                        {receipt.payment_status !== 'pagado_completo' && (
                          <button
                            onClick={() => handleManagePayments(receipt.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                            title="Gestionar Pagos"
                          >
                            <CurrencyDollarIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* CANCELAR - Solo admin y solo si no está completado o cancelado */}
                        {isAdmin && receipt.status !== 'cancelado' && receipt.status !== 'completado' && (
                          <button
                            onClick={() => handleCancelReceipt(receipt)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="Cancelar Recibo"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de scroll sticky — se pega al fondo de la pantalla al hacer scroll */}
        <div
          ref={topScrollRef}
          onScroll={() => { if (tableScrollRef.current) tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft; }}
          style={{ position: 'sticky', bottom: 0, overflowX: 'auto', overflowY: 'hidden', height: 14, zIndex: 10, background: '#fff', borderTop: '1px solid #e5e7eb' }}
        >
          <div ref={el => { if (el && tableScrollRef.current) el.style.width = tableScrollRef.current.scrollWidth + 'px'; }} style={{ height: 1 }} />
        </div>

        {pagination.last_page > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            itemsPerPage={pagination.per_page}
            onPageChange={fetchReceipts}
          />
        )}
      </div>

      {/* Modal para crear nueva venta */}
      <CreateReceiptModal
        show={showCreateModal}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />
      
      {/* Modal para ver detalle del recibo */}
      <ViewReceiptModal
        isOpen={showViewModal}
        onClose={handleModalClose}
        receipt={selectedReceipt}
      />

      {/* Modal de gestión de pagos */}
      {showPaymentsModal && selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <PaymentManager
                  receipt={selectedReceipt}
                  onPaymentAdded={handleModalClose}
                  onClose={() => setShowPaymentsModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal para ver detalle del recibo
const ViewReceiptModal = ({ isOpen, onClose, receipt }) => {
  const [showPayments, setShowPayments] = useState(false);
  
  if (!receipt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Recibo" size="lg">
      <div className="space-y-6">
        {/* Header del recibo */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RECIBO</h1>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-800">Big Arte</h2>
            <p className="text-sm text-gray-600">Gigantografía y Diseño</p>
            <p className="text-sm text-gray-600">Santa Cruz, Bolivia</p>
          </div>
        </div>

        {/* Info del recibo y cliente */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Información del Recibo</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Número:</span> {receipt.receipt_number}</p>
              <p><span className="font-medium">Fecha:</span> {formatDate(receipt.receipt_date)}</p>
              <p><span className="font-medium">Estado:</span> {formatReceiptStatus(receipt.status)}</p>
              <p><span className="font-medium">Vendedor:</span> {receipt.user?.name}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nombre:</span> {receipt.customer_name}</p>
              {receipt.customer_phone && (
                <p><span className="font-medium">Teléfono:</span> {receipt.customer_phone}</p>
              )}
              {receipt.customer_address && (
                <p><span className="font-medium">Dirección:</span> {receipt.customer_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Servicios</h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Servicio
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipt.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-center text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between">
                <span>Impuesto:</span>
                <span>{formatCurrency(receipt.tax)}</span>
              </div>
            )}
            {receipt.discount > 0 && (
              <div className="flex justify-between">
                <span>Descuento:</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(receipt.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Pagos */}
        {(receipt.paid_amount > 0 || receipt.payment_status !== 'sin_anticipo') && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Estado de Pagos</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(receipt.payment_status)}`}>
                {formatPaymentStatus(receipt.payment_status)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Pagado:</span>
                <span className="font-medium">{formatCurrency(receipt.paid_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Saldo Pendiente:</span>
                <span className={`font-medium ${(receipt.total - (receipt.paid_amount || 0)) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(receipt.total - (receipt.paid_amount || 0))}
                </span>
              </div>
              
              {/* Progreso de pago */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso de pago</span>
                  <span>{Math.round(calculatePaymentProgress(receipt.paid_amount || 0, receipt.total))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculatePaymentProgress(receipt.paid_amount || 0, receipt.total)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setShowPayments(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Historial de Pagos →
                </button>
              </div>
            </div>
          </div>
        )}

        {receipt.notes && (
          <div>
            <h3 className="font-medium text-gray-900">Notas</h3>
            <p className="text-sm text-gray-600 mt-1">{receipt.notes}</p>
          </div>
        )}
      </div>
      
      {/* Modal de gestión de pagos anidado */}
      {showPayments && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <PaymentManager
                  receipt={receipt}
                  onPaymentAdded={() => {}}
                  onClose={() => setShowPayments(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default Receipts;
