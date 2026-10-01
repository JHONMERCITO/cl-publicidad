import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const { user, setUser }         = useAuth();

  const [company, setCompany] = useState({
    name: '', address: '', phone: '', email: '', tax_id: '',
  });

  const [receipts, setReceipts] = useState({
    prefix: 'REC', tax_rate: 0, include_logo: true, footer_text: '',
  });

  const [notifications, setNotifications] = useState({
    daily_reports: false, new_sale: true, expense_alerts: true,
  });

  const [security, setSecurity] = useState({
    session_timeout: 60, login_attempts: 5, require_password_change: false,
  });

  const [profile, setProfile] = useState({
    name: '', current_password: '', new_password: '', new_password_confirmation: '',
  });

  // Cargar todas las configuraciones al montar
  useEffect(() => {
    settingsService.getAll()
      .then(data => {
        setCompany(data.company);
        setReceipts(data.receipts);
        setNotifications(data.notifications);
        setSecurity(data.security);
      })
      .catch(() => toast.error('Error al cargar la configuración'))
      .finally(() => setFetching(false));
  }, []);

  // Sincronizar nombre del perfil con usuario autenticado
  useEffect(() => {
    if (user) setProfile(p => ({ ...p, name: user.name }));
  }, [user]);

  const save = async (label, apiFn, data) => {
    setLoading(true);
    try {
      await apiFn(data);
      toast.success(label);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al guardar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (profile.new_password && profile.new_password !== profile.new_password_confirmation) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const payload = { name: profile.name };
      if (profile.new_password) {
        payload.current_password     = profile.current_password;
        payload.new_password         = profile.new_password;
        payload.new_password_confirmation = profile.new_password_confirmation;
      }
      const res = await settingsService.updateProfile(payload);
      if (setUser) setUser(res.user);
      setProfile(p => ({ ...p, current_password: '', new_password: '', new_password_confirmation: '' }));
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar el perfil';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company',       name: 'Empresa',         icon: BuildingStorefrontIcon },
    { id: 'receipts',      name: 'Facturación',      icon: DocumentTextIcon },
    { id: 'notifications', name: 'Notificaciones',   icon: BellIcon },
    { id: 'security',      name: 'Seguridad',        icon: ShieldCheckIcon },
    { id: 'profile',       name: 'Mi Perfil',        icon: UserIcon },
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="mt-1 text-sm text-gray-500">Administra las configuraciones generales del sistema</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">

          {/* ── EMPRESA ── */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la empresa *</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={e => setCompany({ ...company, name: e.target.value })}
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={e => setCompany({ ...company, phone: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Ej: 73149544"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={company.address}
                    onChange={e => setCompany({ ...company, address: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Ej: Sucursal - Av. Cañoto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={e => setCompany({ ...company, email: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="contacto@clpublicidad.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIT / RUC</label>
                  <input
                    type="text"
                    value={company.tax_id}
                    onChange={e => setCompany({ ...company, tax_id: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Número de identificación tributaria"
                  />
                </div>
              </div>
              <Button
                onClick={() => save('Información de empresa guardada', settingsService.updateCompany, company)}
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          )}

          {/* ── FACTURACIÓN ── */}
          {activeTab === 'receipts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Recibos</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prefijo de recibos</label>
                  <input
                    type="text"
                    value={receipts.prefix}
                    onChange={e => setReceipts({ ...receipts, prefix: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="REC"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ejemplo: REC-2026-000001</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tasa de IVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={receipts.tax_rate}
                    onChange={e => setReceipts({ ...receipts, tax_rate: parseFloat(e.target.value) || 0 })}
                    className="mt-1 input-field"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ponlo en 0 si no aplica IVA</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Texto del pie de página</label>
                  <textarea
                    value={receipts.footer_text}
                    onChange={e => setReceipts({ ...receipts, footer_text: e.target.value })}
                    rows={2}
                    className="mt-1 input-field"
                    placeholder="Ej: Gracias por confiar en CL Publicidad y Diseño!"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="include_logo"
                    checked={receipts.include_logo}
                    onChange={e => setReceipts({ ...receipts, include_logo: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="include_logo" className="text-sm text-gray-900">
                    Incluir logo en los recibos PDF
                  </label>
                </div>
              </div>
              <Button
                onClick={() => save('Configuración de facturación guardada', settingsService.updateReceipts, receipts)}
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          )}

          {/* ── NOTIFICACIONES ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Preferencias de Notificaciones</h3>
              <div className="space-y-4">
                {[
                  { key: 'daily_reports',  label: 'Reportes diarios',             desc: 'Recibir resumen diario de actividades' },
                  { key: 'new_sale',       label: 'Notificaciones de nuevas ventas', desc: 'Notificar sobre cada nueva venta registrada' },
                  { key: 'expense_alerts', label: 'Alertas de gastos',             desc: 'Alertas sobre gastos registrados' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`${
                        notifications[key] ? 'bg-primary-500' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200`}
                    >
                      <span className={`${
                        notifications[key] ? 'translate-x-5' : 'translate-x-0'
                      } inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => save('Notificaciones guardadas', settingsService.updateNotifications, notifications)}
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiempo de sesión (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={security.session_timeout}
                    onChange={e => setSecurity({ ...security, session_timeout: parseInt(e.target.value) || 60 })}
                    className="mt-1 input-field"
                  />
                  <p className="mt-1 text-xs text-gray-500">Entre 5 y 480 minutos</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intentos de login máximos</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={security.login_attempts}
                    onChange={e => setSecurity({ ...security, login_attempts: parseInt(e.target.value) || 5 })}
                    className="mt-1 input-field"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="req_pw"
                    checked={security.require_password_change}
                    onChange={e => setSecurity({ ...security, require_password_change: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="req_pw" className="text-sm text-gray-900">
                    Requerir cambio de contraseña cada 90 días
                  </label>
                </div>
              </div>
              <Button
                onClick={() => save('Configuración de seguridad guardada', settingsService.updateSecurity, security)}
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          )}

          {/* ── PERFIL ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="mt-1 input-field bg-gray-50"
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-500">El email no se puede cambiar</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <input
                    type="text"
                    value={user?.role === 'admin' ? 'Administrador' : 'Empleado'}
                    className="mt-1 input-field bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="border-t pt-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Cambiar Contraseña</h4>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                    <input
                      type="password"
                      value={profile.current_password}
                      onChange={e => setProfile({ ...profile, current_password: e.target.value })}
                      className="mt-1 input-field"
                      placeholder="Requerida solo si cambia la contraseña"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                    <input
                      type="password"
                      value={profile.new_password}
                      onChange={e => setProfile({ ...profile, new_password: e.target.value })}
                      className="mt-1 input-field"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={profile.new_password_confirmation}
                      onChange={e => setProfile({ ...profile, new_password_confirmation: e.target.value })}
                      className="mt-1 input-field"
                      placeholder="Repetir nueva contraseña"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} loading={loading}>
                Actualizar Perfil
              </Button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Settings;
