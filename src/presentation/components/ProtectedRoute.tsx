import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
        fontSize: '1.2rem',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #FF0000',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <div>Verificando autenticación...</div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
