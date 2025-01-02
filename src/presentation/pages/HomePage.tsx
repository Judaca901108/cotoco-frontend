import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#000000',
      color: '#FFFFFF',
    }}>
      <img 
        src="/images/logo.jpg" 
        alt="Cotoco Logo" 
        style={{ width: '300px', height: 'auto', marginBottom: '30px' }} 
      />
      <h1 style={{
        fontSize: '3rem',
        color: '#FFFF00',
        marginBottom: '10px',
      }}>
        Página en Construcción
      </h1>
      <p style={{
        fontSize: '1.5rem',
        color: '#FFFFFF',
      }}>
        Estamos trabajando para ofrecerte la mejor experiencia.
      </p>
    </div>
  );
};

export default HomePage;
