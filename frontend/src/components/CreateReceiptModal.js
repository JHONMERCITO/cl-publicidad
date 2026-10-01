import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { receiptService } from '../services/receiptService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { settingsService } from '../services/settingsService';
import {
  PlusIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const CreateReceiptModal = ({ show, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [, setShowAdvancePayment] = useState(false);
  useAuth();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      items: [{ 
        product_name: '', 
        quantity: 1, 
        price: 0, 
        subtotal: 0 
      }],
      tax: 0,
      discount: 0,
      notes: '',
      // Campos para anticipo opcional
      collect_advance: false,
      advance_amount: 0,
      advance_payment_method: 'efectivo',
      advance_notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchTax = watch('tax');
  const watchDiscount = watch('discount');
  const watchCollectAdvance = watch('collect_advance');
  const watchAdvanceAmount = watch('advance_amount');

  // Cargar servicios y tasa de IVA al montar el componente
  useEffect(() => {
    if (show) {
      loadAvailableServices();
      settingsService.getAll().then(data => {
        const rate = data?.receipts?.tax_rate ?? data?.tax_rate ?? 0;
        setValue('tax', parseFloat(rate));
      }).catch(() => {});
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAvailableServices = async () => {
    try {
      setServicesLoading(true);
      const services = await productService.getServicesForDropdown();
      setAvailableServices(services);
    } catch (error) {
      toast.error('Error al cargar los servicios disponibles');
    } finally {
      setServicesLoading(false);
    }
  };

  // Cálculos automáticos
  const subtotal = watchItems?.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
  }, 0) || 0;

  const taxAmount = (subtotal * (parseFloat(watchTax) || 0)) / 100;
  const discountAmount = parseFloat(watchDiscount) || 0;
  const total = subtotal + taxAmount - discountAmount;

  // Validar que el anticipo no exceda el total
  useEffect(() => {
    if (watchCollectAdvance && watchAdvanceAmount > total) {
      setValue('advance_amount', total);
    }
  }, [total, watchAdvanceAmount, watchCollectAdvance, setValue]);

  const addItem = () => {
    append({ 
      product_name: '', 
      quantity: 1, 
      price: 0, 
      subtotal: 0 
    });
  };

  const removeItem = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Manejar selección de servicio desde dropdown
  const handleServiceSelect = (index, serviceId) => {
    const selectedService = availableServices.find(s => s.id === parseInt(serviceId));
    if (selectedService) {
      setValue(`items.${index}.product_name`, selectedService.value);
    }
  };

  const onSubmit = async (data) => {
    if (subtotal <= 0) {
      toast.error('Debe agregar al menos un servicio con precio mayor a 0');
      return;
    }

    if (data.collect_advance && (!data.advance_amount || data.advance_amount <= 0)) {
      toast.error('Si va a cobrar anticipo, debe especificar un monto mayor a 0');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos del recibo
      const receiptData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        receipt_date: new Date().toISOString().split('T')[0],
        items: data.items.map(item => ({
          description: item.product_name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
        tax: taxAmount,
        discount: discountAmount,
        notes: data.notes || null,
      };

      // Crear el recibo
      const response = await receiptService.createReceipt(receiptData);
      const createdReceipt = response.data;

      // Si se va a cobrar anticipo, agregarlo después
      if (data.collect_advance && data.advance_amount > 0) {
        try {
          await receiptService.addPayment(createdReceipt.id, {
            amount: parseFloat(data.advance_amount),
            type: 'anticipo',
            payment_method: data.advance_payment_method,
            notes: data.advance_notes || `Anticipo del ${Math.round((data.advance_amount / total) * 100)}%`
          });
          
          toast.success(`Recibo creado y anticipo de ${formatCurrency(data.advance_amount)} registrado exitosamente`);
        } catch (paymentError) {
          toast.warn(`Recibo creado, pero hubo un error al registrar el anticipo: ${paymentError.response?.data?.message}`);
        }
      } else {
        toast.success('Recibo creado exitosamente');
      }

      reset();
      setShowAdvancePayment(false);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el recibo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setShowAdvancePayment(false);
      setAvailableServices([]);
      onClose();
    }
  };

  return (
    <Modal show={show} onClose={handleClose} size="2xl">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2 text-primary-600" />
          Nueva Venta / Cotización
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
              Información del Cliente
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  {...register('customer_name', { 
                    required: 'El nombre del cliente es requerido' 
                  })}
                  className="input-field"
                  placeholder="Ej: Restaurant El Buen Sabor"
                />
                {errors.customer_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  {...register('customer_phone')}
                  className="input-field"
                  placeholder="Ej: 70123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  {...register('customer_address')}
                  className="input-field"
                  placeholder="Zona/Calle, Ciudad"
                />
              </div>
            </div>
          </div>

          {/* Servicios/Productos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-primary-600" />
                Servicios de Gigantografía
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar Servicio
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-start bg-gray-50 p-4 rounded-lg border">
                  <div className="col-span-12 md:col-span-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción del Servicio *
                    </label>
                    
                    {/* Dropdown de servicios predefinidos */}
                    {availableServices.length > 0 && (
                      <div className="mb-2">
                        <select
                          className="input-field text-sm mb-1"
                          onChange={(e) => handleServiceSelect(index, e.target.value)}
                          disabled={servicesLoading}
                        >
                          <option value="">
                            {servicesLoading ? 'Cargando servicios...' : 'Seleccionar servicio predefinido...'}
                          </option>
                          {availableServices.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.label} {service.category && `(${service.category})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Campo de texto para descripción personalizada */}
                    <input
                      {...register(`items.${index}.product_name`, {
                        required: 'La descripción es requerida'
                      })}
                      className="input-field text-sm"
                      placeholder="Ej: Banner 3x2m exterior con diseño personalizado"
                    />
                    {errors.items?.[index]?.product_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.items[index].product_name.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-5 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`items.${index}.quantity`)}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio {getCurrencySymbol()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`items.${index}.price`)}
                      className="input-field text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={fields.length === 1}
                      className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Eliminar servicio"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Información adicional sobre servicios */}
          </div>

          {/* Cálculos */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
              Totales
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register('tax')}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento {getCurrencySymbol()}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('discount')}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <input
                  {...register('notes')}
                  className="input-field"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>IVA ({watchTax}%):</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Anticipo Opcional */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('collect_advance')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                <CurrencyDollarIcon className="h-5 w-5 inline mr-1 text-green-600" />
                Cobrar anticipo ahora
              </label>
            </div>

            {watchCollectAdvance && (
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto del Anticipo *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      max={total}
                      step="0.01"
                      {...register('advance_amount', {
                        min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                        max: { value: total, message: 'No puede exceder el total' }
                      })}
                      className="input-field"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo: {formatCurrency(total)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pago *
                    </label>
                    <select
                      {...register('advance_payment_method')}
                      className="input-field"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas del Anticipo
                    </label>
                    <input
                      {...register('advance_notes')}
                      className="input-field"
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>

                {watchAdvanceAmount > 0 && (
                  <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                    <strong>Anticipo:</strong> {formatCurrency(watchAdvanceAmount)} 
                    ({Math.round((watchAdvanceAmount / total) * 100)}% del total)
                    <br />
                    <strong>Saldo pendiente:</strong> {formatCurrency(total - watchAdvanceAmount)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={subtotal <= 0}
          >
            {watchCollectAdvance ? 'Crear Recibo y Cobrar Anticipo' : 'Crear Recibo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReceiptModal;

