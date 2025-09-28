import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaFingerprint, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../application/contexts/AuthContext';
import colors from '../../shared/colors';

type HeaderProps = {
  activePage: string;
};

const Header: React.FC<HeaderProps> = ({ activePage }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Opciones del menú de navegación
  const menuItems = [
    { id: 'Home', label: 'INICIO', path: '/dashboard' },
    { id: 'Products', label: 'PRODUCTOS', path: '/dashboard/products' },
    { id: 'PointOfSales', label: 'PUNTOS DE VENTA', path: '/dashboard/point-of-sales' },
    { id: 'Transactions', label: 'TRANSACCIONES', path: '/dashboard/transactions' },
  ];

  const handleMenuClick = (item: any) => {
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

        {/* Información del usuario */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '6px',
          border: `1px solid ${colors.borderColor}`,
        }}>
          <FaUser style={{ color: colors.primaryColor, fontSize: '0.9rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{
              color: colors.textPrimary,
              fontSize: '0.85rem',
              fontWeight: '600',
              lineHeight: '1.2',
            }}>
              {user?.name || 'Usuario'}
            </span>
            <span style={{
              color: colors.textSecondary,
              fontSize: '0.75rem',
              lineHeight: '1.2',
            }}>
              @{user?.username || 'admin'}
            </span>
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
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
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
};

export default Header;
