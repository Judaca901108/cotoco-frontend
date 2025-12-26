import colors from './colors';

export const tableStyles = {
  // Contenedor principal de la página
  pageContainer: {
    padding: '30px',
    backgroundColor: colors.backgroundPrimary,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    margin: 0,
  },

  createButton: {
    backgroundColor: colors.primaryColor,
    color: colors.white,
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
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
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
    minWidth: '600px', // Para permitir scroll horizontal en móviles
  },

  // Cabeceras de la tabla
  tableHeader: {
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.borderColor}`,
  },

  tableHeaderCell: {
    padding: '16px 20px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${colors.borderColor}`,
    whiteSpace: 'nowrap' as const,
  },

  // Filas de la tabla
  tableRow: {
    borderBottom: `1px solid ${colors.borderColor}`,
    transition: 'background-color 0.2s ease',
  },

  tableRowHover: {
    backgroundColor: colors.hoverBackground,
  },

  tableRowAlternate: {
    backgroundColor: colors.backgroundTertiary,
  },

  tableCell: {
    padding: '16px 20px',
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.borderColor}`,
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
    color: colors.success,
    border: `1px solid ${colors.success}`,
  },

  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: colors.error,
    border: `1px solid ${colors.error}`,
  },

  statusPrivate: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: colors.error,
    border: `1px solid ${colors.error}`,
  },

  statusPublic: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: colors.success,
    border: `1px solid ${colors.success}`,
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
    color: colors.white,
  },

  techNode: {
    backgroundColor: '#339933',
    color: colors.white,
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
    backgroundColor: colors.secondaryColor,
    color: colors.white,
  },

  deleteButton: {
    backgroundColor: colors.error,
    color: colors.white,
  },

  viewButton: {
    backgroundColor: colors.primaryColor,
    color: colors.white,
  },

  // Footer de la tabla con búsqueda y paginación
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: colors.backgroundSecondary,
    borderTop: `1px solid ${colors.borderColor}`,
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
    backgroundColor: colors.backgroundPrimary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '6px',
    color: colors.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    width: '200px',
  },

  searchInputFocus: {
    borderColor: colors.primaryColor,
  },

  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },

  paginationInfo: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
  },

  rowsPerPageSelect: {
    padding: '6px 8px',
    backgroundColor: colors.backgroundPrimary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '4px',
    color: colors.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
  },

  paginationButton: {
    padding: '6px 12px',
    backgroundColor: colors.backgroundPrimary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '4px',
    color: colors.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  },

  paginationButtonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },

  paginationButtonActive: {
    backgroundColor: colors.primaryColor,
    color: colors.white,
    borderColor: colors.primaryColor,
  },

  // Estados vacíos
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },

  emptyStateDescription: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
  },

  // Loading state
  loadingState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: colors.textSecondary,
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${colors.borderColor}`,
    borderTop: `3px solid ${colors.primaryColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
};

// Función helper para obtener estilos de fila alternada
export const getRowStyle = (index: number, isHovered: boolean = false) => {
  let style = { ...tableStyles.tableRow };
  
  if (isHovered) {
    style = { ...style, ...tableStyles.tableRowHover };
  } else if (index % 2 === 1) {
    style = { ...style, ...tableStyles.tableRowAlternate };
  }
  
  return style;
};

// Función helper para obtener estilos de botón de acción
export const getActionButtonStyle = (type: 'edit' | 'delete' | 'view') => {
  switch (type) {
    case 'edit':
      return { ...tableStyles.actionButton, ...tableStyles.editButton };
    case 'delete':
      return { ...tableStyles.actionButton, ...tableStyles.deleteButton };
    case 'view':
      return { ...tableStyles.actionButton, ...tableStyles.viewButton };
    default:
      return tableStyles.actionButton;
  }
};

// Función helper para obtener estilos de etiqueta de estado
export const getStatusBadgeStyle = (status: 'active' | 'inactive' | 'private' | 'public') => {
  const baseStyle = tableStyles.statusBadge;
  
  switch (status) {
    case 'active':
      return { ...baseStyle, ...tableStyles.statusActive };
    case 'inactive':
      return { ...baseStyle, ...tableStyles.statusInactive };
    case 'private':
      return { ...baseStyle, ...tableStyles.statusPrivate };
    case 'public':
      return { ...baseStyle, ...tableStyles.statusPublic };
    default:
      return baseStyle;
  }
};

// Función helper para obtener estilos de icono de tecnología
export const getTechIconStyle = (tech: 'gradle' | 'go' | 'node' | 'react') => {
  const baseStyle = tableStyles.techIcon;
  
  switch (tech) {
    case 'gradle':
      return { ...baseStyle, ...tableStyles.techGradle };
    case 'go':
      return { ...baseStyle, ...tableStyles.techGo };
    case 'node':
      return { ...baseStyle, ...tableStyles.techNode };
    case 'react':
      return { ...baseStyle, ...tableStyles.techReact };
    default:
      return baseStyle;
  }
};
