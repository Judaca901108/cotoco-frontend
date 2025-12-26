import React from 'react';
import colors from '../../shared/colors';

const Footer: React.FC = () => {
  return (
    <footer className="footer-responsive" style={{
      backgroundColor: colors.backgroundSecondary,
      padding: '20px',
      textAlign: 'center',
      color: colors.footerText,
      borderTop: `1px solid ${colors.borderColor}`,
      fontSize: '0.9rem',
    }}>
      © 2025 Comic Toys Colombia - Todos los derechos reservados.
    </footer>
  );
};

export default Footer;
