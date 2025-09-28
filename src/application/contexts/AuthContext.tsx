import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials } from '../../infrastructure/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authService.getUser();
        const isAuth = authService.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(isAuth);
        
        // Si el token está expirando, mostrar advertencia
        if (isAuth && authService.isTokenExpiring()) {
          console.warn('El token está próximo a expirar');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('Login exitoso:', response.user.name);
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('Logout exitoso');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
