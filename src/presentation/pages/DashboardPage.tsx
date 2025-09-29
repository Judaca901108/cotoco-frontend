import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import ProductsPage from './ProductsPage'; // Página de Productos
import PointOfSalePage from './PointOfSalePage'; // Página de Puntos de Ventas
import HomePage from './HomePageDashboard'; // Página de Inicio dentro del Dashboard
import PointOfSaleInventoryPage from './PointOfSaleInventoryPage';
import ProductDetailPage from './ProductDetailPage'; // Vista de detalle de producto
import PointOfSaleDetailPage from './PointOfSaleDetailPage'; // Vista de detalle de punto de venta
import TransactionsPage from './TransactionsPage'; // Página de transacciones
import UsersPage from './UsersPage'; // Página de usuarios
import UserDetailPage from './UserDetailPage'; // Vista de detalle de usuario
import SettingsPage from './SettingsPage'; // Página de configuración
import { useAuth } from '../../application/contexts/AuthContext';
import colors from '../../shared/colors';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  // Determinar la página activa basada en la ruta actual
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'Home';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/point-of-sales')) return 'PointOfSales';
        if (path.includes('/transactions')) return 'Transactions';
        if (path.includes('/users')) return 'Users';
        if (path.includes('/settings')) return 'Settings';
        return 'Home';
  };

  const activePage = getActivePage();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh', 
      backgroundColor: colors.backgroundPrimary, 
      color: colors.textPrimary 
    }}>
      {/* Header horizontal */}
      <Header activePage={activePage} />

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '30px',
        backgroundColor: colors.backgroundPrimary,
        overflow: 'auto',
      }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={isAdmin ? <ProductsPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/products/:id" element={isAdmin ? <ProductDetailPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/point-of-sales" element={isAdmin ? <PointOfSalePage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/point-of-sales/:id" element={isAdmin ? <PointOfSaleDetailPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/point-of-sales/:id/inventory" element={isAdmin ? <PointOfSaleInventoryPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/users" element={isAdmin ? <UsersPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/users/:id" element={isAdmin ? <UserDetailPage /> : <Navigate to="/dashboard/transactions" replace />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardPage;
