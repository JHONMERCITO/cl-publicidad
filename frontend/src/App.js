import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

// Lazy loading para todas las páginas
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Receipts = React.lazy(() => import('./pages/Receipts'));
const Expenses = React.lazy(() => import('./pages/Expenses'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Users = React.lazy(() => import('./pages/Users'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="products" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Products />
              </Suspense>
            } />
            <Route path="receipts" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Receipts />
              </Suspense>
            } />
            <Route path="expenses" element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<LoadingSpinner />}>
                  <Expenses />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Reports />
              </Suspense>
            } />
            <Route path="users" element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<LoadingSpinner />}>
                  <Users />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            } />

          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
