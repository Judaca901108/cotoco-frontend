// themeColors.ts - Definición de temas dark y light

export const darkTheme = {
  // Colores principales
  primaryColor: '#FF0000', // Rojo puro
  secondaryColor: '#06B6D4', // Cian
  accentColor: '#F59E0B', // Ámbar
  
  // Colores de fondo
  backgroundPrimary: '#1A1A1A', // Gris muy oscuro
  backgroundSecondary: '#2A2A2A', // Gris oscuro
  backgroundTertiary: '#3A3A3A', // Gris medio oscuro
  
  // Colores de texto
  textPrimary: '#FFFFFF', // Blanco
  textSecondary: '#A1A1AA', // Gris claro
  textMuted: '#71717A', // Gris medio
  
  // Colores del header
  headerBackground: '#1A1A1A', // Gris muy oscuro
  headerText: '#FFFFFF', // Blanco
  headerButtonBackground: '#FF0000', // Rojo puro
  headerButtonText: '#FFFFFF', // Blanco
  
  // Colores de bordes y separadores
  borderColor: '#374151', // Gris oscuro
  borderLight: '#4B5563', // Gris medio
  
  // Colores de hover y estados
  hoverBackground: '#374151', // Gris oscuro
  activeBackground: '#FF0000', // Rojo puro
  
  // Colores de tarjetas
  cardBackground: '#2A2A2A', // Gris oscuro
  cardBorder: '#374151', // Gris oscuro
  
  // Colores de botones
  buttonPrimary: '#FF0000', // Rojo puro
  buttonSecondary: '#374151', // Gris oscuro
  buttonDanger: '#EF4444', // Rojo
  
  // Colores de estado
  success: '#10B981', // Verde
  warning: '#F59E0B', // Ámbar
  error: '#EF4444', // Rojo
  info: '#06B6D4', // Cian
  
  // Colores legacy (para compatibilidad)
  sidebarBackground: '#2A2A2A',
  sidebarActiveBackground: '#FF0000',
  sidebarInactiveText: '#A1A1AA',
  sidebarActiveText: '#FFFFFF',
  
  footerText: '#A1A1AA',
  mainBackground: '#1A1A1A',
  mainText: '#FFFFFF',
  mainHighlight: '#FF0000',
  
  // Colores adicionales
  white: '#FFFFFF',
  black: '#000000',
};

export const lightTheme = {
  // Colores principales
  primaryColor: '#FF0000', // Rojo puro (se mantiene)
  secondaryColor: '#06B6D4', // Cian
  accentColor: '#F59E0B', // Ámbar
  
  // Colores de fondo
  backgroundPrimary: '#FFFFFF', // Blanco
  backgroundSecondary: '#F9FAFB', // Gris muy claro
  backgroundTertiary: '#F3F4F6', // Gris claro
  
  // Colores de texto
  textPrimary: '#111827', // Gris muy oscuro (casi negro)
  textSecondary: '#6B7280', // Gris medio
  textMuted: '#9CA3AF', // Gris claro
  
  // Colores del header
  headerBackground: '#FFFFFF', // Blanco
  headerText: '#111827', // Gris muy oscuro
  headerButtonBackground: '#FF0000', // Rojo puro
  headerButtonText: '#FFFFFF', // Blanco
  
  // Colores de bordes y separadores
  borderColor: '#E5E7EB', // Gris muy claro
  borderLight: '#D1D5DB', // Gris claro
  
  // Colores de hover y estados
  hoverBackground: '#F3F4F6', // Gris claro
  activeBackground: '#FF0000', // Rojo puro
  
  // Colores de tarjetas
  cardBackground: '#FFFFFF', // Blanco
  cardBorder: '#E5E7EB', // Gris muy claro
  
  // Colores de botones
  buttonPrimary: '#FF0000', // Rojo puro
  buttonSecondary: '#E5E7EB', // Gris muy claro
  buttonDanger: '#EF4444', // Rojo
  
  // Colores de estado
  success: '#10B981', // Verde
  warning: '#F59E0B', // Ámbar
  error: '#EF4444', // Rojo
  info: '#06B6D4', // Cian
  
  // Colores legacy (para compatibilidad)
  sidebarBackground: '#F9FAFB',
  sidebarActiveBackground: '#FF0000',
  sidebarInactiveText: '#6B7280',
  sidebarActiveText: '#FFFFFF',
  
  footerText: '#6B7280',
  mainBackground: '#FFFFFF',
  mainText: '#111827',
  mainHighlight: '#FF0000',
  
  // Colores adicionales
  white: '#FFFFFF',
  black: '#000000',
};

export type Theme = typeof darkTheme;
