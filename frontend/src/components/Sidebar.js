import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, adminOnly: false },
  { name: 'Servicios', href: '/products', icon: CubeIcon, adminOnly: false },
  { name: 'Ventas', href: '/receipts', icon: ReceiptPercentIcon, adminOnly: false },
  { name: 'Gastos', href: '/expenses', icon: CurrencyDollarIcon, adminOnly: true },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon, adminOnly: false },
  { name: 'Usuarios', href: '/users', icon: UsersIcon, adminOnly: true },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon, adminOnly: true },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigation.filter(item =>
    !item.adminOnly || user?.role === 'admin'
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
    }
  };

  return (
    <>
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent
            navigation={filteredNavigation}
            location={location}
            user={user}
            onLogout={handleLogout}
            onNavClick={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent
            navigation={filteredNavigation}
            location={location}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, location, user, onLogout, onNavClick }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
    <div className="flex-1">
      <div className="flex items-center h-20 flex-shrink-0 px-4 bg-gradient-to-r from-primary-600 to-primary-500">
        <img
          src="/logo.png"
          alt="CL Publicidad y Diseño"
          className="h-[4.5rem] w-auto object-contain mr-3"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className="text-lg font-bold text-white drop-shadow">CL Publicidad</h1>
      </div>
      
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavClick}
              className={`${
                isActive
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-r-lg`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
    
    {/* User info and logout */}
    <div className="flex-shrink-0 border-t border-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="ml-auto p-2 text-gray-400 hover:text-gray-500"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);

export default Sidebar;
