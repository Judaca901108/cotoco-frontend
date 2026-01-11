import React from 'react';
import { FaHammer, FaRocket } from 'react-icons/fa';
import { useTheme } from '../../application/contexts/ThemeContext';

const HomePage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.backgroundPrimary,
      color: theme.textPrimary,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: theme.headerBackground,
        padding: '20px 40px',
        borderBottom: `1px solid ${theme.borderColor}`,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }} className="home-header-responsive">
        <div style={{
          backgroundColor: theme.primaryColor,
          color: theme.white,
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          letterSpacing: '1px',
        }}>
          COTOCO
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }} className="home-main-responsive">
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px',
        }}>
          {/* Construction Icon */}
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: theme.primaryColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            animation: 'pulse 2s infinite',
          }}>
            <FaHammer style={{ fontSize: '3rem', color: theme.white }} />
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }} className="home-h1-responsive">
            Página en Construcción
          </h1>

          <p style={{
            fontSize: '1.3rem',
            color: theme.textSecondary,
            marginBottom: '40px',
            maxWidth: '600px',
            lineHeight: '1.6',
          }} className="home-p-responsive">
            Estamos trabajando duro para ofrecerte la mejor experiencia de gestión empresarial. 
            Pronto tendrás acceso a todas las funcionalidades.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '60px',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: theme.primaryColor,
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: theme.primaryColor,
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.16s',
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: theme.primaryColor,
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.32s',
            }} />
          </div>
        </div>


        {/* Coming Soon Badge */}
        <div style={{
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: `1px solid ${theme.primaryColor}`,
          borderRadius: '12px',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
        }}>
          <FaRocket style={{ fontSize: '1.2rem', color: theme.primaryColor }} />
          <span style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: theme.primaryColor,
          }}>
            Próximamente: Funcionalidades completas
          </span>
        </div>

        {/* Progress Indicator */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '40px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: theme.textSecondary,
            }}>
              Progreso del desarrollo
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: theme.primaryColor,
            }}>
              75%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: theme.backgroundSecondary,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '75%',
              height: '100%',
              backgroundColor: theme.primaryColor,
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: theme.backgroundSecondary,
        padding: '30px 40px',
        borderTop: `1px solid ${theme.borderColor}`,
        textAlign: 'center',
      }} className="home-footer-responsive">
        <p style={{
          fontSize: '0.9rem',
          color: theme.textMuted,
          margin: 0,
        }}>
          © 2025 Comic Toys Colombia - Todos los derechos reservados.
        </p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
