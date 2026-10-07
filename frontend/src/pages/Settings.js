import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import branchService from '../services/branchService';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const { user, setUser }         = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Sucursales state ──────────────────────────────────────────────────────────
  const [branches, setBranches]         = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch]   = useState(null);
  const [branchForm, setBranchForm]     = useState({ name: '', address: '', phone: '' });

  const [company, setCompany] = useState({
    name: '', address: '', phone: '', email: '', tax_id: '',
  });

  const [receipts, setReceipts] = useState({
    prefix: 'REC', tax_rate: 0, include_logo: true, footer_text: '',
  });

  const [profile, setProfile] = useState({
    name: '', current_password: '', new_password: '', new_password_confirmation: '',
  });

  // ── Sucursales handlers ───────────────────────────────────────────────────────
  const fetchBranches = useCallback(async () => {
    setBranchLoading(true);
    try {
      const res = await branchService.getAll();
      setBranches(res.data);
    } catch {
      toast.error('Error al cargar sucursales');
    } finally {
      setBranchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'branches') fetchBranches();
  }, [activeTab, fetchBranches]);

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setBranchLoading(true);
    try {
      if (editingBranch) {
        await branchService.update(editingBranch.id, branchForm);
        toast.success('Sucursal actualizada');
      } else {
        await branchService.create(branchForm);
        toast.success('Sucursal creada');
      }
      setShowBranchForm(false);
      setEditingBranch(null);
      setBranchForm({ name: '', address: '', phone: '' });
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar sucursal');
    } finally {
      setBranchLoading(false);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({ name: branch.name, address: branch.address || '', phone: branch.phone || '' });
    setShowBranchForm(true);
  };

  const handleDeleteBranch = async (branch) => {
    if (!window.confirm(`¿Eliminar la sucursal "${branch.name}"?`)) return;
    setBranchLoading(true);
    try {
      await branchService.delete(branch.id);
      toast.success('Sucursal eliminada');
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se puede eliminar: tiene usuarios asignados');
    } finally {
      setBranchLoading(false);
    }
  };

  const handleCancelBranchForm = () => {
    setShowBranchForm(false);
    setEditingBranch(null);
    setBranchForm({ name: '', address: '', phone: '' });
  };

  // Cargar todas las configuraciones al montar
  useEffect(() => {
    settingsService.getAll()
      .then(data => {
        setCompany(data.company);
        setReceipts(data.receipts);
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
    { id: 'profile',       name: 'Mi Perfil',        icon: UserIcon },
    ...(isAdmin ? [{ id: 'branches', name: 'Sucursales', icon: BuildingOfficeIcon }] : []),
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
              </div>
              <Button
                onClick={() => save('Configuración de facturación guardada', settingsService.updateReceipts, receipts)}
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          )}

          {/* ── SUCURSALES ── */}
          {activeTab === 'branches' && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Sucursales</h3>
                {!showBranchForm && (
                  <Button onClick={() => setShowBranchForm(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nueva Sucursal
                  </Button>
                )}
              </div>

              {showBranchForm && (
                <form onSubmit={handleBranchSubmit} className="bg-gray-50 rounded-lg p-5 space-y-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
                    </h4>
                    <button type="button" onClick={handleCancelBranchForm} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={branchForm.name}
                        onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                        className="mt-1 input-field"
                        placeholder="Ej: Sucursal Norte"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <input
                        type="text"
                        value={branchForm.address}
                        onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                        className="mt-1 input-field"
                        placeholder="Ej: Av. Cañoto #123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="text"
                        value={branchForm.phone}
                        onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                        className="mt-1 input-field"
                        placeholder="Ej: 73149544"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={handleCancelBranchForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" loading={branchLoading}>
                      {editingBranch ? 'Actualizar' : 'Crear'} Sucursal
                    </Button>
                  </div>
                </form>
              )}

              {branchLoading && !showBranchForm ? (
                <div className="text-center py-8 text-gray-400">Cargando sucursales...</div>
              ) : branches.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay sucursales registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {branches.map(branch => (
                        <tr key={branch.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{branch.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{branch.address || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{branch.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {branch.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditBranch(branch)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBranch(branch)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
