import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  PlusIcon,
  TrashIcon,
  CubeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const Products = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchServices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({ active: 'true' });
      setServices(response.data.data);
    } catch (error) {
      toast.error('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`¿Eliminar el servicio "${service.name}"?`)) {
      try {
        await productService.deleteProduct(service.id);
        toast.success('Servicio eliminado');
        fetchServices();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al eliminar el servicio');
      }
    }
  };

  if (loading && services.length === 0) {
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <CubeIcon className="h-8 w-8 mr-3 text-primary-600" />
            Servicios
          </h2>
          <p className="text-gray-600 mt-1">
            Tipos de servicios disponibles para agregar en las ventas.
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        )}
      </div>

      {/* Lista de servicios */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {services.map((service) => (
            <li key={service.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">{service.name}</span>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingService(service)}
                    className="text-gray-400 hover:text-primary-600"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay servicios</h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega tu primer servicio con el botón de arriba.
            </p>
          </div>
        )}
      </div>

      <ServiceFormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); fetchServices(); }}
      />
      <ServiceFormModal
        isOpen={!!editingService}
        service={editingService}
        onClose={() => { setEditingService(null); fetchServices(); }}
      />
    </div>
  );
};

const ServiceFormModal = ({ isOpen, onClose, service = null }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const isEditing = !!service;

  useEffect(() => {
    if (isOpen) reset({ name: service?.name || '' });
  }, [isOpen, service, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await productService.updateProduct(service.id, { name: data.name });
        toast.success('Servicio actualizado');
      } else {
        await productService.createProduct({ name: data.name });
        toast.success('Servicio creado');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del servicio *
          </label>
          <input
            {...register('name', { required: 'El nombre es requerido' })}
            type="text"
            className="mt-1 input-field"
            placeholder="Ej: Banner, Lona, Vinilo..."
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Products;
