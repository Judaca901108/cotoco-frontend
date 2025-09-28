import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import ProductsPage from './ProductsPage'; // Página de Productos
import PointOfSalePage from './PointOfSalePage'; // Página de Puntos de Ventas
import HomePage from './HomePageDashboard'; // Página de Inicio dentro del Dashboard
import PointOfSaleInventoryPage from './PointOfSaleInventoryPage';
import ProductDetailPage from './ProductDetailPage'; // Vista de detalle de producto
import PointOfSaleDetailPage from './PointOfSaleDetailPage'; // Vista de detalle de punto de venta
import TransactionsPage from './TransactionsPage'; // Página de transacciones
import colors from '../../shared/colors';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  
  // Determinar la página activa basada en la ruta actual
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'Home';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/point-of-sales')) return 'PointOfSales';
    if (path.includes('/transactions')) return 'Transactions';
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
      <Header 
        activePage={activePage} 
        onLogout={() => {
          alert('Cerrando sesión...');
          // Aquí podrías agregar la lógica real de logout
        }} 
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '30px',
        backgroundColor: colors.backgroundPrimary,
        overflow: 'auto',
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/point-of-sales" element={<PointOfSalePage />} />
          <Route path="/point-of-sales/:id" element={<PointOfSaleDetailPage />} />
          <Route path="/point-of-sales/:id/inventory" element={<PointOfSaleInventoryPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          {/* Agrega más rutas aquí */}
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardPage;
