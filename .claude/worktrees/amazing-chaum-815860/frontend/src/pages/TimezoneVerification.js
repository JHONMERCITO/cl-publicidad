import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getTimezoneInfo } from '../utils/formatters';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const TimezoneVerification = () => {
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [frontendTimezone, setFrontendTimezone] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    verifyTimezone();
    getFrontendTimezone();
  }, []);

  const getFrontendTimezone = () => {
    const timezoneInfo = getTimezoneInfo();
    setFrontendTimezone(timezoneInfo);
  };

  const verifyTimezone = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timezone/verify');
      setVerificationData(response.data.data);
    } catch (error) {
      console.error('Error verificando zona horaria:', error);
      toast.error('Error al verificar zona horaria');
    } finally {
      setLoading(false);
    }
  };

  const testTimestamp = async () => {
    try {
      const response = await api.post('/timezone/test');
      toast.success('Test de timestamp completado');
      console.log('Test result:', response.data.data);
    } catch (error) {
      toast.error('Error en test de timestamp');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'incorrect':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
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
            Verificación de Zona Horaria
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Verificar que el sistema esté usando correctamente la zona horaria de Bolivia
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={verifyTimezone}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Verificar Nuevamente
          </button>
          <button
            onClick={testTimestamp}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Test Timestamp
          </button>
        </div>
      </div>

      {/* Estado General */}
      {verificationData && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            {getStatusIcon(verificationData.status)}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Estado de Zona Horaria
              </h3>
              <p className={`text-sm ${
                verificationData.status === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                {verificationData.status === 'correct' 
                  ? '✅ Zona horaria configurada correctamente' 
                  : '❌ Zona horaria requiere corrección'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuración del Backend */}
      {verificationData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              🔧 Configuración del Backend (Laravel)
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Configuración</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Zona horaria:</span>
                    <span className={`font-medium ${
                      verificationData.config.is_timezone_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {verificationData.config.app_timezone}
                      {verificationData.config.is_timezone_correct ? ' ✅' : ' ❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offset Bolivia:</span>
                    <span className={`font-medium ${
                      verificationData.config.is_offset_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      UTC{verificationData.config.bolivia_offset}
                      {verificationData.config.is_offset_correct ? ' ✅' : ' ❌'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Horas Actuales</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sistema:</span>
                    <span className="font-mono">{verificationData.times.system_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bolivia:</span>
                    <span className="font-mono">{verificationData.times.bolivia_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTC:</span>
                    <span className="font-mono">{verificationData.times.utc_time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Frontend */}
      {frontendTimezone && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ⚛️ Información del Frontend (React)
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Configuración JavaScript</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Zona horaria:</span>
                    <span className={`font-medium ${
                      frontendTimezone.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {frontendTimezone.timezone}
                      {frontendTimezone.isCorrect ? ' ✅' : ' ❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offset:</span>
                    <span className="font-medium">{frontendTimezone.offset}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Horas Formateadas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hora local:</span>
                    <span className="font-mono">{frontendTimezone.localTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora Bolivia:</span>
                    <span className="font-mono">{frontendTimezone.boliviaTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formateada:</span>
                    <span className="font-mono">{frontendTimezone.formattedBoliviaTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Base de Datos */}
      {verificationData && verificationData.database && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              🗄️ Registros en Base de Datos
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verificationData.database.latest_receipt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Último Recibo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Número:</span>
                      <span className="font-medium">{verificationData.database.latest_receipt.receipt_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Creado:</span>
                      <span className="font-mono">{verificationData.database.latest_receipt.created_at}</span>
                    </div>
                    {verificationData.database.latest_receipt.receipt_date && (
                      <div className="flex justify-between">
                        <span>Fecha recibo:</span>
                        <span className="font-mono">{verificationData.database.latest_receipt.receipt_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {verificationData.database.latest_payment && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Último Pago</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">{verificationData.database.latest_payment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monto:</span>
                      <span className="font-medium">Bs {verificationData.database.latest_payment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagado:</span>
                      <span className="font-mono">{verificationData.database.latest_payment.paid_at}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {verificationData && verificationData.recommendations.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              💡 Recomendaciones
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {verificationData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{rec.message}</p>
                    {rec.action !== 'none' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Acción: {rec.action}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comandos útiles */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            🛠️ Comandos Útiles
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-1">Verificar desde terminal:</h4>
              <code className="text-sm text-gray-600">php artisan timezone:verify</code>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-1">Limpiar configuración:</h4>
              <code className="text-sm text-gray-600">php artisan config:clear</code>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-1">Verificar configuración:</h4>
              <code className="text-sm text-gray-600">php artisan config:show app.timezone</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneVerification;
