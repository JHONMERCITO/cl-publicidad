import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('¡Bienvenido a CL Publicidad y Diseño!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Credenciales incorrectas';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #A01520 0%, #C0202A 50%, #2C6DA0 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20"
          style={{ background: '#fff' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-20"
          style={{ background: '#fff' }} />
        <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full opacity-10"
          style={{ background: '#fff' }} />

        <div className="relative z-10 text-center px-12">
          <img
            src="/logo.png"
            alt="CL Publicidad y Diseño"
            className="h-40 w-auto mx-auto mb-8 drop-shadow-xl"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow">
            CL Publicidad y Diseño
          </h1>
          <p className="text-white text-opacity-90 text-lg leading-relaxed">
            Sistema de gestión para<br />publicidad y diseño gráfico
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo visible solo en mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="CL Publicidad y Diseño"
              className="h-24 w-auto"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-800">
              Iniciar sesión
            </h2>
            <p className="text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                })}
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#F5901E' }}
                onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px #A0152040'; e.target.style.borderColor = '#A01520'; }}
                onBlur={(e) => { e.target.style.boxShadow = ''; e.target.style.borderColor = '#D1D5DB'; }}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px #A0152040'; e.target.style.borderColor = '#A01520'; }}
                onBlur={(e) => { e.target.style.boxShadow = ''; e.target.style.borderColor = '#D1D5DB'; }}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-70"
              style={{ background: 'linear-gradient(90deg, #A01520, #C0202A)' }}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} CL Publicidad y Diseño — Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
