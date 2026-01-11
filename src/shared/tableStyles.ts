import { Theme, darkTheme } from './themeColors';

// Función que genera los estilos de tabla basados en el tema
export const getTableStyles = (theme: Theme) => ({
  // Contenedor principal de la página
  pageContainer: {
    padding: '30px',
    backgroundColor: theme.backgroundPrimary,
    color: theme.textPrimary,
    minHeight: '100vh',
  },

  // Header de la página con título y botón de crear
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },

  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.textPrimary,
    margin: 0,
  },

  createButton: {
    backgroundColor: theme.primaryColor,
    color: theme.white,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Contenedor de la tabla
  tableContainer: {
    backgroundColor: theme.cardBackground,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflowX: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },

  // Tabla principal
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
    minWidth: '600px',
  },

  // Cabeceras de la tabla
  tableHeader: {
    backgroundColor: theme.backgroundSecondary,
    borderBottom: `1px solid ${theme.borderColor}`,
  },

  tableHeaderCell: {
    padding: '16px 20px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: theme.textPrimary,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${theme.borderColor}`,
    whiteSpace: 'nowrap' as const,
  },

  // Filas de la tabla
  tableRow: {
    borderBottom: `1px solid ${theme.borderColor}`,
    transition: 'background-color 0.2s ease',
  },

  tableRowHover: {
    backgroundColor: theme.hoverBackground,
  },

  tableRowAlternate: {
    backgroundColor: theme.backgroundTertiary,
  },

  tableCell: {
    padding: '16px 20px',
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.borderColor}`,
    verticalAlign: 'middle' as const,
    fontSize: '0.9rem',
  },

  // Etiquetas de estado
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: theme.success,
    border: `1px solid ${theme.success}`,
  },

  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: theme.error,
    border: `1px solid ${theme.error}`,
  },

  statusPrivate: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: theme.error,
    border: `1px solid ${theme.error}`,
  },

  statusPublic: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: theme.success,
    border: `1px solid ${theme.success}`,
  },

  // Iconos de tecnología
  techIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },

  techGradle: {
    backgroundColor: '#02303A',
    color: '#81C784',
  },

  techGo: {
    backgroundColor: '#00ADD8',
    color: theme.white,
  },

  techNode: {
    backgroundColor: '#339933',
    color: theme.white,
  },

  techReact: {
    backgroundColor: '#61DAFB',
    color: '#20232A',
  },

  // Botones de acción
  actionButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  },

  editButton: {
    backgroundColor: theme.secondaryColor,
    color: theme.white,
  },

  deleteButton: {
    backgroundColor: theme.error,
    color: theme.white,
  },

  viewButton: {
    backgroundColor: theme.primaryColor,
    color: theme.white,
  },

  // Footer de la tabla con búsqueda y paginación
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: theme.backgroundSecondary,
    borderTop: `1px solid ${theme.borderColor}`,
    flexWrap: 'wrap' as const,
    gap: '16px',
  },

  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  searchInput: {
    padding: '8px 12px',
    backgroundColor: theme.backgroundPrimary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    color: theme.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    width: '200px',
  },

  searchInputFocus: {
    borderColor: theme.primaryColor,
  },

  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },

  paginationInfo: {
    fontSize: '0.9rem',
    color: theme.textSecondary,
  },

  rowsPerPageSelect: {
    padding: '6px 8px',
    backgroundColor: theme.backgroundPrimary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '4px',
    color: theme.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
  },

  paginationButton: {
    padding: '6px 12px',
    backgroundColor: theme.backgroundPrimary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '4px',
    color: theme.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  },

  paginationButtonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },

  paginationButtonActive: {
    backgroundColor: theme.primaryColor,
    color: theme.white,
    borderColor: theme.primaryColor,
  },

  // Estados vacíos
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: theme.textSecondary,
  },

  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    opacity: 0.5,
  },

  emptyStateTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: theme.textPrimary,
  },

  emptyStateDescription: {
    fontSize: '0.9rem',
    color: theme.textSecondary,
  },

  // Loading state
  loadingState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: theme.textSecondary,
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${theme.borderColor}`,
    borderTop: `3px solid ${theme.primaryColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
});

// Función helper para obtener estilos de fila alternada
export const getRowStyle = (index: number, isHovered: boolean = false, theme: Theme) => {
  const styles = getTableStyles(theme);
  let style = { ...styles.tableRow };
  
  if (isHovered) {
    style = { ...style, ...styles.tableRowHover };
  } else if (index % 2 === 1) {
    style = { ...style, ...styles.tableRowAlternate };
  }
  
  return style;
};

// Función helper para obtener estilos de botón de acción
export const getActionButtonStyle = (type: 'edit' | 'delete' | 'view', theme: Theme) => {
  const styles = getTableStyles(theme);
  switch (type) {
    case 'edit':
      return { ...styles.actionButton, ...styles.editButton };
    case 'delete':
      return { ...styles.actionButton, ...styles.deleteButton };
    case 'view':
      return { ...styles.actionButton, ...styles.viewButton };
    default:
      return styles.actionButton;
  }
};

// Función helper para obtener estilos de etiqueta de estado
export const getStatusBadgeStyle = (status: 'active' | 'inactive' | 'private' | 'public', theme: Theme) => {
  const styles = getTableStyles(theme);
  const baseStyle = styles.statusBadge;
  
  switch (status) {
    case 'active':
      return { ...baseStyle, ...styles.statusActive };
    case 'inactive':
      return { ...baseStyle, ...styles.statusInactive };
    case 'private':
      return { ...baseStyle, ...styles.statusPrivate };
    case 'public':
      return { ...baseStyle, ...styles.statusPublic };
    default:
      return baseStyle;
  }
};

// Función helper para obtener estilos de icono de tecnología
export const getTechIconStyle = (tech: 'gradle' | 'go' | 'node' | 'react', theme: Theme) => {
  const styles = getTableStyles(theme);
  const baseStyle = styles.techIcon;
  
  switch (tech) {
    case 'gradle':
      return { ...baseStyle, ...styles.techGradle };
    case 'go':
      return { ...baseStyle, ...styles.techGo };
    case 'node':
      return { ...baseStyle, ...styles.techNode };
    case 'react':
      return { ...baseStyle, ...styles.techReact };
    default:
      return baseStyle;
  }
};

// Exportar función para compatibilidad con código existente
// Los componentes deben migrar a usar getTableStyles(theme) directamente
export const tableStyles = getTableStyles(darkTheme);
