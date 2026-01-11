import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaPhone, FaIdCard, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { getDetailStyles, getActionButtonStyle } from '../../shared/detailStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useTheme } from '../../application/contexts/ThemeContext';

import { API_BASE_URL } from '../../config/apiConfig';
const BASE_PATH = API_BASE_URL;

type User = {
  id: number;
  username: string;
  name: string;
  celular: string;
  documentoIdentidad: string;
  isActive: boolean;
};

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const detailStyles = getDetailStyles(theme);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    authenticatedFetch(`${BASE_PATH}/users/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Usuario no encontrado');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Datos del usuario recibidos:', data);
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;

    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`${BASE_PATH}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        alert(`Usuario ${action}do correctamente`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${res.status}: ${res.statusText}`;
        alert(`Error al ${action} usuario: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error(`Error al ${action} usuario:`, error);
      alert(`Error al ${action} usuario: ${error.message}`);
    }
  };


  if (loading) {
    return (
      <div style={detailStyles.pageContainer} className="page-container-responsive">
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textPrimary }}>Cargando usuario...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={detailStyles.pageContainer} className="page-container-responsive">
        <button
          style={detailStyles.backButton}
          onClick={() => navigate('/dashboard/users')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.buttonSecondary;
          }}
        >
          <FaArrowLeft />
          Volver a Usuarios
        </button>
        
        <div style={detailStyles.emptyState}>
          <div style={detailStyles.emptyStateIcon}>❌</div>
          <div style={detailStyles.emptyStateTitle}>Usuario no encontrado</div>
          <div style={detailStyles.emptyStateDescription}>
            {error || 'El usuario que buscas no existe o ha sido eliminado.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={detailStyles.pageContainer} className="page-container-responsive">
      {/* Botón de regreso */}
      <button
        style={detailStyles.backButton}
        onClick={() => navigate('/dashboard/users')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.hoverBackground;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.buttonSecondary;
        }}
      >
        <FaArrowLeft />
        Volver a Usuarios
      </button>

      {/* Header con título y badge */}
      <div style={detailStyles.detailHeader} className="detail-header-responsive">
        <h1 style={detailStyles.detailTitle}>{user.name}</h1>
        <span style={{
          backgroundColor: theme.primaryColor,
          color: theme.white,
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
        }}>
          ID: {user.id}
        </span>
      </div>

      {/* Sección de información del usuario */}
      <div style={detailStyles.infoSection}>
        <h2 style={detailStyles.infoTitle}>
          <FaUser />
          INFORMACIÓN DEL USUARIO
        </h2>
        
        {/* Layout principal: Avatar a la izquierda, información a la derecha */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '50px',
          alignItems: 'start',
        }}>
          {/* Columna de avatar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'sticky',
            top: '20px',
          }}>
            <div style={{
              border: `3px solid ${theme.borderColor}`,
              borderRadius: '50%',
              padding: '30px',
              backgroundColor: theme.backgroundTertiary,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
              width: '200px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Efecto de brillo sutil */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
                opacity: 0.6,
              }} />
              
              <div style={{
                fontSize: '4rem',
                fontWeight: '700',
                color: theme.primaryColor,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* Información adicional del avatar */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: theme.textSecondary,
              fontSize: '1rem',
              padding: '16px 24px',
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.borderColor}`,
              width: '100%',
              maxWidth: '200px',
            }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '6px',
                color: theme.textPrimary,
                fontSize: '1.1rem',
              }}>
                👤 Perfil de Usuario
              </div>
              <div style={{ 
                fontSize: '0.9rem',
                opacity: 0.8,
              }}>
                @{user.username}
              </div>
            </div>
          </div>

          {/* Columna de información */}
          <div style={detailStyles.infoGrid}>
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>ID</span>
              <span style={detailStyles.infoValueCode}>{user.id}</span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Nombre de Usuario</span>
              <span style={detailStyles.infoValue}>
                <FaUser style={{ marginRight: '8px', color: theme.primaryColor }} />
                @{user.username}
              </span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Nombre Completo</span>
              <span style={detailStyles.infoValue}>{user.name}</span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Celular</span>
              <span style={detailStyles.infoValue}>
                <FaPhone style={{ marginRight: '8px', color: theme.success }} />
                {user.celular}
              </span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Documento de Identidad</span>
              <span style={detailStyles.infoValue}>
                <FaIdCard style={{ marginRight: '8px', color: theme.secondaryColor }} />
                {user.documentoIdentidad}
              </span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Estado</span>
              <span style={detailStyles.infoValue}>
                {user.isActive ? (
                  <>
                    <FaUserCheck style={{ marginRight: '8px', color: theme.success }} />
                    <span style={{ color: theme.success, fontWeight: '600' }}>Activo</span>
                  </>
                ) : (
                  <>
                    <FaUserTimes style={{ marginRight: '8px', color: theme.error }} />
                    <span style={{ color: theme.error, fontWeight: '600' }}>Inactivo</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={detailStyles.checkboxContainer}>
          <input
            type="checkbox"
            id="active"
            style={detailStyles.checkbox}
            defaultChecked={user.isActive}
            disabled
          />
          <label htmlFor="active" style={detailStyles.checkboxLabel}>
            Usuario Activo
          </label>
        </div>
      </div>

      {/* Sección de acciones */}
      <div style={{
        ...detailStyles.actionsSection,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <button 
          style={{
            ...getActionButtonStyle(user.isActive ? 'secondary' : 'primary', theme),
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          }} 
          onClick={handleToggleStatus}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
          }}
        >
          {user.isActive ? (
            <>
              <FaUserTimes />
              Desactivar Usuario
            </>
          ) : (
            <>
              <FaUserCheck />
              Activar Usuario
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserDetailPage;
