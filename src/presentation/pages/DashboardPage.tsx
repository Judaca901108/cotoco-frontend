import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import ProductsPage from './ProductsPage'; // Página de Productos
import PointOfSalePage from './PointOfSalePage'; // Página de Puntos de Ventas
import InventoryPage from './InventoryPage';
import HomePage from './HomePageDashboard'; // Página de Inicio dentro del Dashboard

const DashboardPage: React.FC = () => {
  const [activePage, setActivePage] = useState('Home');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F5F5F5', color: '#000000' }}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Header activePage={activePage} onLogout={() => alert('Cerrando sesión...')} />

        {/* Dynamic Content */}
        <main style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#F5F5F5',
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/point-of-sales" element={<PointOfSalePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            {/* Agrega más rutas aquí */}
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
