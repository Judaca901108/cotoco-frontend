import React, { useState } from 'react';
import { FaUser, FaLock, FaCog, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../application/contexts/AuthContext';
import { authenticatedFetch } from '../../infrastructure/authService';
import colors from '../../shared/colors';

const BASE_PATH = "http://localhost:3000";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario de perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    celular: user?.celular || '',
  });

  // Estados para el formulario de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Limpiar mensajes
  const clearMessages = () => {
    setError('');
    setSuccess('');
    setErrors({});
  };

  // Validar formulario de perfil
  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }
    
    if (!profileData.celular.trim()) {
      newErrors.celular = 'El celular es obligatorio.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(profileData.celular.replace(/\s/g, ''))) {
      newErrors.celular = 'Ingrese un número de celular válido.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar formulario de contraseña
  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria.';
    }
    
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria.';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres.';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!validateProfile()) return;
    
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${BASE_PATH}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          celular: profileData.celular,
        }),
      });

      if (res.ok) {
        setSuccess('Perfil actualizado correctamente');
        // El perfil se ha actualizado correctamente
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Error al actualizar el perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!validatePassword()) return;
    
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${BASE_PATH}/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (res.ok) {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Error al cambiar la contraseña');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: colors.backgroundPrimary,
    color: colors.textPrimary,
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '30px',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: '10px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: colors.textSecondary,
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: `1px solid ${colors.borderColor}`,
  };

  const tabStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: colors.primaryColor,
    borderBottomColor: colors.primaryColor,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '12px',
    padding: '30px',
    border: `1px solid ${colors.borderColor}`,
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: colors.primaryColor,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: colors.primaryColor,
    color: colors.white,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: colors.textMuted,
    cursor: 'not-allowed',
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${colors.error}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: colors.error,
    fontSize: '0.9rem',
  };

  const successStyle: React.CSSProperties = {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: `1px solid ${colors.success}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: colors.success,
    fontSize: '0.9rem',
  };

  const passwordInputContainerStyle: React.CSSProperties = {
    position: 'relative',
  };

  const passwordToggleStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <FaCog style={{ marginRight: '12px', color: colors.primaryColor }} />
          Configuración
        </h1>
        <p style={subtitleStyle}>
          Gestiona tu perfil y configuración de cuenta
        </p>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        <button
          style={activeTab === 'profile' ? activeTabStyle : tabStyle}
          onClick={() => {
            setActiveTab('profile');
            clearMessages();
          }}
        >
          <FaUser style={{ marginRight: '8px' }} />
          Perfil
        </button>
        <button
          style={activeTab === 'password' ? activeTabStyle : tabStyle}
          onClick={() => {
            setActiveTab('password');
            clearMessages();
          }}
        >
          <FaLock style={{ marginRight: '8px' }} />
          Contraseña
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {/* Contenido de las tabs */}
      <div style={cardStyle}>
        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile}>
            <h2 style={{ marginBottom: '20px', color: colors.textPrimary }}>
              Información del Perfil
            </h2>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nombre Completo</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                style={errors.name ? inputFocusStyle : inputStyle}
                placeholder="Tu nombre completo"
              />
              {errors.name && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Celular</label>
              <input
                type="tel"
                value={profileData.celular}
                onChange={(e) => setProfileData({ ...profileData, celular: e.target.value })}
                style={errors.celular ? inputFocusStyle : inputStyle}
                placeholder="+57 300 123 4567"
              />
              {errors.celular && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.celular}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Nombre de Usuario</label>
              <input
                type="text"
                value={user?.username || ''}
                style={{ ...inputStyle, backgroundColor: colors.backgroundTertiary, opacity: 0.6 }}
                disabled
                placeholder="No se puede cambiar"
              />
              <div style={{ color: colors.textSecondary, fontSize: '0.8rem', marginTop: '4px' }}>
                El nombre de usuario no se puede modificar
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? buttonDisabledStyle : buttonStyle}
            >
              <FaSave />
              {loading ? 'Actualizando...' : 'Actualizar Perfil'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <h2 style={{ marginBottom: '20px', color: colors.textPrimary }}>
              Cambiar Contraseña
            </h2>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Contraseña Actual</label>
              <div style={passwordInputContainerStyle}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={errors.currentPassword ? inputFocusStyle : inputStyle}
                  placeholder="Tu contraseña actual"
                />
                <button
                  type="button"
                  style={passwordToggleStyle}
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.currentPassword}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Nueva Contraseña</label>
              <div style={passwordInputContainerStyle}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={errors.newPassword ? inputFocusStyle : inputStyle}
                  placeholder="Tu nueva contraseña"
                />
                <button
                  type="button"
                  style={passwordToggleStyle}
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.newPassword}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirmar Nueva Contraseña</label>
              <div style={passwordInputContainerStyle}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={errors.confirmPassword ? inputFocusStyle : inputStyle}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  style={passwordToggleStyle}
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? buttonDisabledStyle : buttonStyle}
            >
              <FaLock />
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
