import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Lógica simple para simular un login exitoso
    if (email === 'admin@cotoco.com' && password === 'password123') {
      alert('Login successful!');
      navigate('/dashboard'); // Redirige al Dashboard
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
    }}>
      {/* Logo */}
      <div style={{ marginTop: '60px' }}>
        <img
          src="/images/logo-large.jpg" // Ruta del logo largo
          alt="Cotoco Logo"
          style={{
            width: '400px', // Ajusta el tamaño según sea necesario
            height: 'auto',
          }}
        />
      </div>

      {/* Formulario de Login */}
      <div style={{
        backgroundColor: '#1A1A1A',
        padding: '20px',
        borderRadius: '10px',
        width: '300px',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
      }}>
        <h2 style={{
          color: '#FFFF00',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          Iniciar Sesión
        </h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '90%',
              padding: '10px',
              borderRadius: '5px',
              border: `1px solid #FF0000`,
              backgroundColor: '#333333',
              color: '#FFFFFF',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '90%',
              padding: '10px',
              borderRadius: '5px',
              border: `1px solid #FF0000`,
              backgroundColor: '#333333',
              color: '#FFFFFF',
              fontSize: '1rem',
            }}
          />
        </div>
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#FF0000',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '20px',
        padding: '10px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#1A1A1A',
        color: '#FFFF00',
      }}>
        © 2024 Comic Toys Colombia - Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LoginPage;
