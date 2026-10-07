import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { setAuthToken, clearAuthToken, getStoredToken, setStoredUser, getStoredUser } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user, 
        token: action.payload.token 
      };
    case 'LOGIN_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload, 
        isAuthenticated: false, 
        user: null, 
        token: null 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        token: null, 
        loading: false, 
        error: null 
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const storedToken = getStoredToken();
const storedUser = getStoredUser();

const initialState = {
  isAuthenticated: !!(storedToken && storedUser),
  user: storedUser || null,
  token: storedToken || null,
  loading: storedToken ? true : false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from stored token on app init
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    setAuthToken(token);
    authService.me()
      .then(res => {
        const user = res.data.user;
        setStoredUser(user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          // Token inválido — cerrar sesión
          clearAuthToken();
          dispatch({ type: 'LOGOUT' });
        } else {
          // Error temporal (red/servidor) — usar datos en caché
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: storedUser, token } });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      const { access_token, user } = response.data;
      setAuthToken(access_token);
      setStoredUser(user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: access_token } });
      return response;
    } catch (error) {
      clearAuthToken();
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Error de conexión al servidor';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout();
      }
    } catch (error) {
      // silencioso — el logout local siempre procede
    } finally {
      clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      const { access_token, user } = response.data;
      
      // Configurar token en el servicio API
      setAuthToken(access_token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: access_token
        }
      });
      
      return response;
    } catch (error) {
      // Limpiar token en caso de error
      clearAuthToken();
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error de conexión';
      
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  const setUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
