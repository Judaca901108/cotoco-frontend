import React from 'react';
import { useTheme } from '../../application/contexts/ThemeContext';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  return (
    <footer className="footer-responsive" style={{
      backgroundColor: theme.backgroundSecondary,
      padding: '20px',
      textAlign: 'center',
      color: theme.footerText,
      borderTop: `1px solid ${theme.borderColor}`,
      fontSize: '0.9rem',
    }}>
      © 2025 Comic Toys Colombia - Todos los derechos reservados.
    </footer>
  );
};

export default Footer;
