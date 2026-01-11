import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme, Theme } from '../../shared/themeColors';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Obtener tema del localStorage o usar 'dark' por defecto
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const [theme, setTheme] = useState<Theme>(themeMode === 'light' ? lightTheme : darkTheme);

  // Actualizar tema cuando cambia el modo
  useEffect(() => {
    setTheme(themeMode === 'light' ? lightTheme : darkTheme);
    localStorage.setItem('theme', themeMode);
    
    // Aplicar clase al body para facilitar estilos CSS si es necesario
    document.body.className = themeMode === 'light' ? 'light-theme' : 'dark-theme';
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeModeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
