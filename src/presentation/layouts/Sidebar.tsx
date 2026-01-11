import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaStore } from 'react-icons/fa';
import { useTheme } from '../../application/contexts/ThemeContext';

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Opciones del menú
  const menuItems = [
    { id: 'Home', label: 'Inicio', path: '/dashboard', icon: <FaHome /> },
    { id: 'Products', label: 'Productos', path: '/dashboard/products', icon: <FaBox /> },
    { id: 'PointOfSales', label: 'Puntos de Venta', path: '/dashboard/point-of-sales', icon: <FaStore /> },
    { id: 'Inventory', label: 'Inventario', path: '/dashboard/inventory' },
    { id: 'Transactions', label: 'Transacciones', path: '/dashboard/transactions' },
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: theme.sidebarBackground,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '20px' }}>
        <img
          src="/images/logo-large.png" // Ruta del logo
          alt="Cotoco Logo"
          style={{
            width: '100%',
            height: '70px',
          }}
        />
      </div>

      {/* Items del Menú */}
      <ul style={{
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        width: '100%',
      }}>
        {menuItems.map((item) => (
          <li
            key={item.id}
            style={{
              padding: '10px 20px',
              margin: '10px 0',
              borderRadius: '5px',
              backgroundColor: activePage === item.id ? theme.sidebarActiveBackground : 'transparent',
              cursor: 'pointer',
              color: activePage === item.id ? theme.sidebarActiveText : theme.sidebarInactiveText,
              fontWeight: activePage === item.id ? 'bold' : 'normal',
            }}
            onClick={() => {
              setActivePage(item.id); // Cambiar la página activa
              navigate(item.path); // Navegar a la ruta correspondiente
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;