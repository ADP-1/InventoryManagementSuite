import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const CategoriesPage = React.lazy(() => import('../pages/inventory/CategoriesPage'));
const ProductsPage = React.lazy(() => import('../pages/inventory/ProductsPage'));
const CustomersPage = React.lazy(() => import('../pages/customers/CustomersPage'));
const InvoicesPage = React.lazy(() => import('../pages/billing/InvoicesPage'));
const AnalyticsPage = React.lazy(() => import('../pages/analytics/AnalyticsPage'));

const SuspenseLayout = () => (
  <Suspense fallback={
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <LoadingSpinner size={40} />
    </div>
  }>
    <AppLayout />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <SuspenseLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'inventory/categories',
        element: <CategoriesPage />,
      },
      {
        path: 'inventory/products',
        element: <ProductsPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'billing/invoices',
        element: <InvoicesPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
