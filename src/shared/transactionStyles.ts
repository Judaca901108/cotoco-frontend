import colors from './colors';

export const transactionStyles = {
  // Estilos para la página de transacciones
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  // Header de la página
  pageHeader: {
    marginBottom: '30px',
  },
  
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  pageSubtitle: {
    fontSize: '1rem',
    color: colors.textSecondary,
    margin: 0,
  },
  
  // Barra de herramientas
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },
  
  // Filtros
  filtersContainer: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  
  filterSelect: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '6px',
    color: colors.textPrimary,
    outline: 'none',
    minWidth: '120px',
  },
  
  // Botones de acción
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.primaryColor,
    color: colors.white,
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  
  // Estilos para las tarjetas de transacción
  transactionCard: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  
  transactionCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: colors.primaryColor,
  },
  
  // Header de la tarjeta
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  
  transactionType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  
  transactionDate: {
    fontSize: '0.8rem',
    color: colors.textSecondary,
  },
  
  // Contenido de la tarjeta
  cardContent: {
    marginBottom: '12px',
  },
  
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  
  productName: {
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: '1rem',
  },
  
  productDetails: {
    fontSize: '0.8rem',
    color: colors.textSecondary,
  },
  
  quantityInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  
  quantityValue: {
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  
  remarks: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: '8px',
  },
  
  // Footer de la tarjeta
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.borderColor}`,
  },
  
  pointOfSaleInfo: {
    fontSize: '0.8rem',
    color: colors.textSecondary,
  },
  
  transactionId: {
    fontSize: '0.7rem',
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
};

// Función para obtener el estilo del badge según el tipo de transacción
export const getTransactionTypeStyle = (type: string) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  };

  switch (type) {
    case 'sale':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: colors.error,
        border: `1px solid ${colors.error}`,
      };
    case 'restock':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: colors.success,
        border: `1px solid ${colors.success}`,
      };
    case 'adjustment':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        color: colors.warning,
        border: `1px solid ${colors.warning}`,
      };
    case 'transfer':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        color: colors.info,
        border: `1px solid ${colors.info}`,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        color: colors.textSecondary,
        border: `1px solid ${colors.textSecondary}`,
      };
  }
};

// Función para obtener el estilo de la cantidad según el tipo de transacción
export const getQuantityStyle = (quantity: number, transactionType: string) => {
  const baseStyle = {
    fontWeight: '700',
    fontSize: '1.1rem',
  };

  // Usar el mismo color que el tipo de transacción
  switch (transactionType) {
    case 'sale':
      return {
        ...baseStyle,
        color: colors.error, // Rojo para ventas
      };
    case 'restock':
      return {
        ...baseStyle,
        color: colors.success, // Verde para reabastecimiento
      };
    case 'adjustment':
      return {
        ...baseStyle,
        color: colors.warning, // Amarillo para ajustes
      };
    case 'transfer':
      return {
        ...baseStyle,
        color: colors.info, // Cian para transferencias
      };
    default:
      return {
        ...baseStyle,
        color: colors.textSecondary,
      };
  }
};

// Función para obtener el icono según el tipo de transacción
export const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return '💰';
    case 'restock':
      return '📦';
    case 'adjustment':
      return '⚖️';
    case 'transfer':
      return '🔄';
    default:
      return '📋';
  }
};

// Función para obtener el texto descriptivo del tipo
export const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'sale':
      return 'Venta';
    case 'restock':
      return 'Reabastecimiento';
    case 'adjustment':
      return 'Ajuste';
    case 'transfer':
      return 'Transferencia';
    default:
      return 'Transacción';
  }
};
