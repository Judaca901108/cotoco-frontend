import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaCog, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../application/contexts/AuthContext';
import { useTheme } from '../../application/contexts/ThemeContext';

type HeaderProps = {
  activePage: string;
};

const Header: React.FC<HeaderProps> = ({ activePage }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Opciones del menú de navegación basadas en el rol
  const getMenuItems = () => {
    const allMenuItems = [
      { id: 'Home', label: 'INICIO', path: '/dashboard' },
      { id: 'Products', label: 'PRODUCTOS', path: '/dashboard/products', adminOnly: true },
      { id: 'PointOfSales', label: 'PUNTOS DE VENTA', path: '/dashboard/point-of-sales', adminOnly: true },
      { id: 'Transactions', label: 'TRANSACCIONES', path: '/dashboard/transactions' },
      { id: 'Analytics', label: 'ANALYTICS', path: '/dashboard/analytics' },
      { id: 'Users', label: 'USUARIOS', path: '/dashboard/users', adminOnly: true },
    ];

    // Si es admin, mostrar todos los menús
    if (isAdmin) {
      return allMenuItems;
    }

    // Si es usuario normal, solo mostrar inicio y transacciones
    return allMenuItems.filter(item => !item.adminOnly);
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (item: any) => {
    navigate(item.path);
    setMobileMenuOpen(false); // Cerrar menú móvil al hacer clic
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
  };

  return (
    <>
      <header className="header-responsive" style={{
        backgroundColor: theme.headerBackground,
        padding: '0 20px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.borderColor}`,
        position: 'relative',
        zIndex: 1000,
      }}>
        {/* Logo y botón hamburguesa (móvil) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Botón hamburguesa (solo móvil) */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: theme.textPrimary,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '8px',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <div style={{
            backgroundColor: theme.primaryColor,
            color: theme.white,
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }} onClick={() => navigate('/dashboard')}>
            COTOCO
          </div>

          {/* Enlaces de navegación (desktop) */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '30px' }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activePage === item.id ? theme.primaryColor : theme.textSecondary,
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: activePage === item.id ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleMenuClick(item)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Elementos del usuario (derecha) */}
        <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Selector de tema */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={themeMode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {themeMode === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {/* Icono de configuración */}
          <button
            onClick={handleSettings}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Configuración"
          >
            <FaCog />
          </button>

          {/* Información del usuario (desktop) */}
          <div className="user-info-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: theme.backgroundSecondary,
            borderRadius: '6px',
            border: `1px solid ${theme.borderColor}`,
          }}>
            <FaUser style={{ color: theme.primaryColor, fontSize: '0.9rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{
                color: theme.textPrimary,
                fontSize: '0.85rem',
                fontWeight: '600',
                lineHeight: '1.2',
              }}>
                {user?.name || 'Usuario'}
              </span>
              <span style={{
                color: theme.textSecondary,
                fontSize: '0.75rem',
                lineHeight: '1.2',
              }}>
                @{user?.username || 'admin'}
              </span>
            </div>
          </div>

          {/* Usuario móvil (solo icono) */}
          <div className="user-info-mobile" style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: theme.backgroundSecondary,
            borderRadius: '6px',
            border: `1px solid ${theme.borderColor}`,
          }}>
            <FaUser style={{ color: theme.primaryColor, fontSize: '1rem' }} />
          </div>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Cerrar sesión"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* Menú móvil (overlay) */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <nav 
        className={`mobile-nav ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}
        style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          width: '280px',
          height: 'calc(100vh - 70px)',
          backgroundColor: theme.headerBackground,
          borderRight: `1px solid ${theme.borderColor}`,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px 0',
        }}
      >
        {/* Información del usuario en móvil */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.borderColor}`,
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaUser style={{ color: theme.primaryColor, fontSize: '1.2rem' }} />
            <div>
              <div style={{
                color: theme.textPrimary,
                fontSize: '0.9rem',
                fontWeight: '600',
              }}>
                {user?.name || 'Usuario'}
              </div>
              <div style={{
                color: theme.textSecondary,
                fontSize: '0.8rem',
              }}>
                @{user?.username || 'admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Items del menú móvil */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            style={{
              width: '100%',
              background: activePage === item.id ? theme.backgroundSecondary : 'transparent',
              border: 'none',
              color: activePage === item.id ? theme.primaryColor : theme.textPrimary,
              fontSize: '1rem',
              fontWeight: activePage === item.id ? '600' : '400',
              cursor: 'pointer',
              padding: '16px 20px',
              textAlign: 'left',
              borderLeft: activePage === item.id ? `4px solid ${theme.primaryColor}` : '4px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {item.label}
          </button>
        ))}

        {/* Botón de configuración en móvil */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${theme.borderColor}`,
          marginTop: '16px',
        }}>
          <button
            onClick={() => {
              handleSettings();
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: theme.textPrimary,
              fontSize: '1rem',
              fontWeight: '400',
              cursor: 'pointer',
              padding: '12px 0',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <FaCog style={{ fontSize: '1rem' }} />
            Configuración
          </button>
        </div>
      </nav>
    </>
  );
};

export default Header;
