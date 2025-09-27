import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaFingerprint, FaSignOutAlt } from 'react-icons/fa';
import colors from '../../shared/colors';

type HeaderProps = {
  activePage: string;
  onLogout: () => void;
};

const Header: React.FC<HeaderProps> = ({ activePage, onLogout }) => {
  const navigate = useNavigate();

  // Opciones del menú de navegación
  const menuItems = [
    { id: 'Home', label: 'INICIO', path: '/dashboard' },
    { id: 'Products', label: 'PRODUCTOS', path: '/dashboard/products' },
    { id: 'PointOfSales', label: 'PUNTOS DE VENTA', path: '/dashboard/point-of-sales' },
    { id: 'Inventory', label: 'INVENTARIO', path: '/dashboard/inventory' },
    { id: 'Transactions', label: 'TRANSACCIONES', path: '/dashboard/transactions' },
  ];

  const handleMenuClick = (item: any) => {
    navigate(item.path);
  };

  return (
    <header style={{
      backgroundColor: colors.headerBackground,
      padding: '0 30px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${colors.borderColor}`,
    }}>
      {/* Logo y navegación izquierda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {/* Logo */}
        <div style={{
          backgroundColor: colors.primaryColor,
          color: colors.white,
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }} onClick={() => navigate('/dashboard')}>
          COTOCO
        </div>

        {/* Enlaces de navegación */}
        <nav style={{ display: 'flex', gap: '30px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === item.id ? colors.primaryColor : colors.textSecondary,
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: activePage === item.id ? `2px solid ${colors.primaryColor}` : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleMenuClick(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Elementos del usuario (derecha) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Toggle de modo claro/oscuro */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaSun />
        </button>

        {/* Icono de perfil/seguridad */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaFingerprint />
        </button>

        {/* Nombre del usuario */}
        <span style={{
          color: colors.textPrimary,
          fontSize: '0.9rem',
          fontWeight: '500',
        }}>
          Usuario Admin
        </span>

        {/* Botón de logout */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
          }}
          onClick={onLogout}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
};

export default Header;
