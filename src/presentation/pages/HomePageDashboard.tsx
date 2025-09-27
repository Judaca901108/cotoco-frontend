import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaStore, 
  FaWarehouse, 
  FaChartLine, 
  FaUsers, 
  FaCog, 
  FaFileAlt, 
  FaBell,
  FaShieldAlt 
} from 'react-icons/fa';
import colors from '../../shared/colors';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Enlaces frecuentes como en la imagen
  const frequentLinks = [
    {
      id: 'products',
      title: 'Gestión de Productos',
      description: 'Administra tu catálogo',
      icon: <FaBox />,
      color: '#F59E0B', // Ámbar
      path: '/dashboard/products'
    },
    {
      id: 'point-of-sales',
      title: 'Puntos de Venta',
      description: 'Gestiona tus tiendas',
      icon: <FaStore />,
      color: '#10B981', // Verde
      path: '/dashboard/point-of-sales'
    },
    {
      id: 'inventory',
      title: 'Control de Inventario',
      description: 'Monitorea tu stock',
      icon: <FaWarehouse />,
      color: '#06B6D4', // Cian
      path: '/dashboard/inventory'
    },
    {
      id: 'analytics',
      title: 'Reportes y Análisis',
      description: 'Visualiza tus datos',
      icon: <FaChartLine />,
      color: '#8B5CF6', // Púrpura
      path: '/dashboard/analytics'
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Administra el acceso',
      icon: <FaUsers />,
      color: '#EF4444', // Rojo
      path: '/dashboard/users'
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <FaCog />,
      color: '#6B7280', // Gris
      path: '/dashboard/settings'
    },
    {
      id: 'reports',
      title: 'Documentos',
      description: 'Genera reportes',
      icon: <FaFileAlt />,
      color: '#F97316', // Naranja
      path: '/dashboard/reports'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Mantente informado',
      icon: <FaBell />,
      color: '#EC4899', // Rosa
      path: '/dashboard/notifications'
    },
    {
      id: 'security',
      title: 'Seguridad',
      description: 'Protege tu sistema',
      icon: <FaShieldAlt />,
      color: '#84CC16', // Lima
      path: '/dashboard/security'
    }
  ];

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Saludo personalizado */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '10px',
          background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ¿Listo Usuario Admin?
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: colors.textSecondary,
          margin: 0,
        }}>
          Bienvenido al panel de control de Cotoco. Gestiona tu negocio desde aquí.
        </p>
      </div>

      {/* Sección de enlaces frecuentes */}
      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '30px',
        }}>
          Enlaces frecuentes
        </h2>

        {/* Grid de tarjetas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {frequentLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.path)}
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = link.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = colors.cardBorder;
              }}
            >
              {/* Icono */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: link.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontSize: '1.2rem',
                flexShrink: 0,
              }}>
                {link.icon}
              </div>

              {/* Contenido */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  margin: '0 0 4px 0',
                }}>
                  {link.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: colors.textSecondary,
                  margin: 0,
                }}>
                  {link.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;