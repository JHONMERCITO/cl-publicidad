import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { expenseService } from '../services/expenseService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    search: '',
    date_from: '',
    date_to: '',
  });
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const response = await expenseService.getExpenses({
        ...filters,
        page,
      });
      setExpenses(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      });
    } catch (error) {
      toast.error('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseService.getCategories();
      setCategories(response.data);
    } catch (error) {
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setShowCreateModal(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleViewExpense = async (expenseId) => {
    try {
      const response = await expenseService.getExpense(expenseId);
      setSelectedExpense(response.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Error al cargar el gasto');
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (window.confirm(`¿Está seguro de eliminar el gasto "${expense.description}"?`)) {
      try {
        await expenseService.deleteExpense(expense.id);
        toast.success('Gasto eliminado exitosamente');
        fetchExpenses(pagination.current_page);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al eliminar el gasto');
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedExpense(null);
    fetchExpenses(pagination.current_page);
  };

  if (loading && expenses.length === 0) {
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
            Gastos
          </h2>
        </div>
        {isAdmin && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={handleCreateExpense}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="mt-1 input-field"
              placeholder="Descripción o número de factura..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proveedor
            </label>
            <input
              type="text"
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="mt-1 input-field"
              placeholder="Nombre del proveedor..."
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

      {/* Tabla de gastos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado por
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </div>
                      {expense.invoice_number && (
                        <div className="text-sm text-gray-500">
                          Factura: {expense.invoice_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.supplier || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(expense.expense_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.user?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewExpense(expense.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver Detalle"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {pagination.last_page > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            itemsPerPage={pagination.per_page}
            onPageChange={fetchExpenses}
          />
        )}
      </div>

      {/* Modales */}
      <ExpenseFormModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        title="Nuevo Gasto"
      />
      
      <ExpenseFormModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        title="Editar Gasto"
        expense={selectedExpense}
      />
      
      <ViewExpenseModal
        isOpen={showViewModal}
        onClose={handleModalClose}
        expense={selectedExpense}
      />
    </div>
  );
};

// Modal para crear/editar gasto
const ExpenseFormModal = ({ isOpen, onClose, title, expense = null }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        expense_date: expense.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        description: '',
        amount: '',
        category: '',
        supplier: '',
        invoice_number: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (expense) {
        await expenseService.updateExpense(expense.id, data);
        toast.success('Gasto actualizado exitosamente');
      } else {
        await expenseService.createExpense(data);
        toast.success('Gasto creado exitosamente');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const commonCategories = [
    'Materiales',
    'Servicios',
    'Equipos',
    'Mantenimiento',
    'Marketing',
    'Transporte',
    'Oficina',
    'Servicios Públicos',
    'Personal',
    'Otros',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <input
              {...register('description', { required: 'La descripción es requerida' })}
              type="text"
              className="mt-1 input-field"
              placeholder="Descripción del gasto..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monto *
            </label>
            <input
              {...register('amount', { 
                required: 'El monto es requerido',
                min: { value: 0.01, message: 'El monto debe ser mayor a 0' }
              })}
              type="number"
              step="0.01"
              min="0"
              className="mt-1 input-field"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría *
            </label>
            <select {...register('category', { required: 'La categoría es requerida' })} className="mt-1 input-field">
              <option value="">Seleccionar categoría...</option>
              {commonCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proveedor
            </label>
            <input
              {...register('supplier')}
              type="text"
              className="mt-1 input-field"
              placeholder="Nombre del proveedor..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Factura
            </label>
            <input
              {...register('invoice_number')}
              type="text"
              className="mt-1 input-field"
              placeholder="Número de factura..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha del Gasto *
            </label>
            <input
              {...register('expense_date', { required: 'La fecha es requerida' })}
              type="date"
              className="mt-1 input-field"
            />
            {errors.expense_date && (
              <p className="mt-1 text-sm text-red-600">{errors.expense_date.message}</p>
            )}
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 input-field"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {expense ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para ver detalle del gasto
const ViewExpenseModal = ({ isOpen, onClose, expense }) => {
  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Gasto" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <p className="mt-1 text-sm text-gray-900">{expense.description}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monto
            </label>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <p className="mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                {expense.category}
              </span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(expense.expense_date)}
            </p>
          </div>
          
          {expense.supplier && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proveedor
              </label>
              <p className="mt-1 text-sm text-gray-900">{expense.supplier}</p>
            </div>
          )}
          
          {expense.invoice_number && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número de Factura
              </label>
              <p className="mt-1 text-sm text-gray-900">{expense.invoice_number}</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registrado por
          </label>
          <p className="mt-1 text-sm text-gray-900">{expense.user?.name}</p>
          <p className="text-xs text-gray-500">
            {formatDate(expense.created_at)}
          </p>
        </div>
        
        {expense.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <p className="mt-1 text-sm text-gray-900">{expense.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Expenses;
