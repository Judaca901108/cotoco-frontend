import React from 'react';
import colors from '../../shared/colors';

type HeaderProps = {
  activePage: string;
  onLogout: () => void;
};

const Header: React.FC<HeaderProps> = ({ activePage, onLogout }) => {
  return (
    <header style={{
      backgroundColor: colors.headerBackground,
      padding: '10px 20px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <h1 style={{ fontSize: '1.5rem', color: colors.headerText }} />
      <button
        style={{
          backgroundColor: colors.headerButtonBackground,
          color: colors.headerButtonText,
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        onClick={onLogout}
      >
        Cerrar Sesión
      </button>
    </header>
  );
};

export default Header;
