import colors from './colors';

export const detailStyles = {
  // Contenedor principal de la página de detalle
  pageContainer: {
    padding: '30px',
    backgroundColor: colors.backgroundPrimary,
    color: colors.textPrimary,
    minHeight: '100vh',
  },

  // Botón de regreso
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.buttonSecondary,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
    textDecoration: 'none',
  },

  // Header principal con título y badge
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },

  detailTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },

  techBadge: {
    backgroundColor: colors.primaryColor,
    color: colors.white,
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  // Sección INFO principal
  infoSection: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  infoTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Grid de información clave-valor
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  infoLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  infoValue: {
    fontSize: '1rem',
    color: colors.textPrimary,
    fontWeight: '500',
    wordBreak: 'break-word' as const,
  },

  infoValueCode: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  },

  // Sección de acciones
  actionsSection: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  actionsTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '20px',
  },

  actionsGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },

  actionButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  primaryAction: {
    backgroundColor: colors.primaryColor,
    color: colors.white,
  },

  secondaryAction: {
    backgroundColor: colors.secondaryColor,
    color: colors.white,
  },

  dangerAction: {
    backgroundColor: colors.error,
    color: colors.white,
  },

  // Sección de datos relacionados (tabla)
  relatedDataSection: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  relatedDataTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Tabla de datos relacionados
  relatedTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
  },

  relatedTableHeader: {
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.borderColor}`,
  },

  relatedTableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  relatedTableRow: {
    borderBottom: `1px solid ${colors.borderColor}`,
    transition: 'background-color 0.2s ease',
  },

  relatedTableRowHover: {
    backgroundColor: colors.hoverBackground,
  },

  relatedTableCell: {
    padding: '12px 16px',
    color: colors.textPrimary,
    verticalAlign: 'middle' as const,
  },

  // Estados y badges
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

  statusWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: colors.warning,
    border: `1px solid ${colors.warning}`,
  },

  // Estados vacíos
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: colors.textSecondary,
  },

  emptyStateIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    opacity: 0.5,
  },

  emptyStateTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '6px',
    color: colors.textPrimary,
  },

  emptyStateDescription: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
  },

  // Checkboxes
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
  },

  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: colors.primaryColor,
  },

  checkboxLabel: {
    fontSize: '0.9rem',
    color: colors.textPrimary,
    fontWeight: '500',
  },
};

// Función helper para obtener estilos de botón de acción
export const getActionButtonStyle = (type: 'primary' | 'secondary' | 'danger') => {
  const baseStyle = detailStyles.actionButton;
  
  switch (type) {
    case 'primary':
      return { ...baseStyle, ...detailStyles.primaryAction };
    case 'secondary':
      return { ...baseStyle, ...detailStyles.secondaryAction };
    case 'danger':
      return { ...baseStyle, ...detailStyles.dangerAction };
    default:
      return { ...baseStyle, ...detailStyles.primaryAction };
  }
};

// Función helper para obtener estilos de badge de estado
export const getStatusBadgeStyle = (status: 'active' | 'inactive' | 'warning') => {
  const baseStyle = detailStyles.statusBadge;
  
  switch (status) {
    case 'active':
      return { ...baseStyle, ...detailStyles.statusActive };
    case 'inactive':
      return { ...baseStyle, ...detailStyles.statusInactive };
    case 'warning':
      return { ...baseStyle, ...detailStyles.statusWarning };
    default:
      return baseStyle;
  }
};
