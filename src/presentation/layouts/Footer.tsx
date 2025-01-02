import React from 'react';
import colors from '../../shared/colors';

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: colors.mainBackground,
      padding: '10px',
      textAlign: 'center',
      color: colors.footerText,
    }}>
      © 2025 Comic Toys Colombia - Todos los derechos reservados.
    </footer>
  );
};

export default Footer;
