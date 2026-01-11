import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../application/contexts/AuthContext';
import { useTheme } from '../../application/contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    } else {
      setErrors({});
    }
  }, [error]);

  const handleLogin = async () => {
    try {
      clearError();
      setErrors({});

      // Validación básica
      if (!username.trim()) {
        setErrors({ username: 'El nombre de usuario es obligatorio' });
        return;
      }
      if (!password.trim()) {
        setErrors({ password: 'La contraseña es obligatoria' });
        return;
      }

      await login({ username, password });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mostrar mensaje de error más descriptivo
      let errorMessage = error.message || 'Error al iniciar sesión';
      
      // Si es un error de red, mostrar información más útil
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('No se puede conectar')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo y accesible desde la red.';
      }
      
      setErrors({ general: errorMessage });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: theme.backgroundPrimary,
      color: theme.textPrimary,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }} className="login-page-responsive">
      {/* Sección Principal del Login */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
        position: 'relative',
      }} className="login-main-responsive">
        {/* Header con Logo */}
        <div>
          {/* Logo */}
          <div style={{
            backgroundColor: theme.primaryColor,
            color: theme.white,
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '1px',
            display: 'inline-block',
          }}>
            COTOCO
          </div>
        </div>

        {/* Formulario de Login Centrado */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          {/* Títulos */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }} className="login-title-responsive">
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: theme.textPrimary,
              margin: '0 0 12px 0',
              letterSpacing: '-0.5px',
            }} className="login-h1-responsive">
              Sign in to your account
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: theme.textSecondary,
              margin: 0,
              fontWeight: '400',
            }} className="login-p-responsive">
              Welcome, ready to manage your business?
            </p>
          </div>

          {/* Formulario */}
          <div style={{ width: '100%' }}>
            {/* Campo Username */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: '8px',
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
          <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
            style={{
                    width: '100%',
                    padding: '16px',
              fontSize: '1rem',
                    backgroundColor: '#E5F3E5', // Fondo amarillo verdoso como en la imagen
                    border: 'none',
                    borderRadius: '8px',
                    color: '#1A1A1A',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="admin"
                />
                {errors.username && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.error,
                  }}>
                    <FaExclamationCircle />
                  </div>
                )}
              </div>
              {errors.username && (
                <div style={{
                  fontSize: '0.8rem',
                  color: theme.error,
                  marginTop: '4px',
                }}>
                  {errors.username}
                </div>
              )}
        </div>

            {/* Campo Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
          <input
                  type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
            style={{
                    width: '100%',
                    padding: '16px 50px 16px 16px',
              fontSize: '1rem',
                    backgroundColor: '#E5F3E5', // Fondo amarillo verdoso como en la imagen
                    border: 'none',
                    borderRadius: '8px',
                    color: '#1A1A1A',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <div style={{
                    position: 'absolute',
                    right: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.error,
                  }}>
                    <FaExclamationCircle />
                  </div>
                )}
              </div>
              {errors.password && (
                <div style={{
                  fontSize: '0.8rem',
                  color: theme.error,
                  marginTop: '4px',
                }}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Enlace Forgot Password */}
            <div style={{ marginBottom: '32px' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.secondaryColor,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Forgot your password?
              </button>
            </div>

            {/* Error General */}
            {errors.general && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${theme.error}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px',
                color: theme.error,
                fontSize: '0.9rem',
                textAlign: 'center',
              }}>
                {errors.general}
        </div>
            )}

            {/* Botón de Login */}
        <button
          onClick={handleLogin}
              disabled={isLoading}
          style={{
            width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                backgroundColor: isLoading ? theme.textMuted : theme.secondaryColor,
                color: theme.white,
            border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? 'INICIANDO SESIÓN...' : 'LETS GO'}
        </button>
          </div>
      </div>

      {/* Footer */}
        <div style={{
        textAlign: 'center',
          color: theme.textMuted,
          fontSize: '0.9rem',
        }}>
          © 2025 Comic Toys Colombia - Todos los derechos reservados.
        </div>
      </div>

      {/* Sección Derecha - Placeholder para imagen o contenido adicional */}
      <div style={{
        width: '40%',
        backgroundColor: theme.backgroundSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-sidebar-responsive">
        <div style={{
          textAlign: 'center',
          color: theme.textMuted,
          fontSize: '1.2rem',
          fontWeight: '500',
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            backgroundColor: theme.primaryColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            opacity: 0.1,
          }}>
            <span style={{ fontSize: '4rem' }}>🎯</span>
          </div>
          <p>Welcome to Cotoco</p>
          <p style={{ fontSize: '1rem', marginTop: '8px' }}>
            Your business management platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
