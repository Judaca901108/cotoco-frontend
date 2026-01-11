import { Theme, darkTheme } from './themeColors';

// Función que genera los estilos de transacciones basados en el tema
export const getTransactionStyles = (theme: Theme) => ({
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
    color: theme.textPrimary,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  pageSubtitle: {
    fontSize: '1rem',
    color: theme.textSecondary,
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
    backgroundColor: theme.backgroundTertiary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    color: theme.textPrimary,
    outline: 'none',
    minWidth: '120px',
  },
  
  // Botones de acción
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: theme.primaryColor,
    color: theme.white,
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
    backgroundColor: theme.cardBackground,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  
  transactionCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.primaryColor,
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
    color: theme.textSecondary,
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
    color: theme.textPrimary,
    fontSize: '1rem',
  },
  
  productDetails: {
    fontSize: '0.8rem',
    color: theme.textSecondary,
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
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: '8px',
  },
  
  // Footer de la tarjeta
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.borderColor}`,
  },
  
  pointOfSaleInfo: {
    fontSize: '0.8rem',
    color: theme.textSecondary,
  },
  
  transactionId: {
    fontSize: '0.7rem',
    color: theme.textMuted,
    fontFamily: 'monospace',
  },
});

// Función para obtener el estilo del badge según el tipo de transacción
export const getTransactionTypeStyle = (type: string, theme: Theme) => {
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
        color: theme.error,
        border: `1px solid ${theme.error}`,
      };
    case 'restock':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: theme.success,
        border: `1px solid ${theme.success}`,
      };
    case 'adjustment':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        color: theme.warning,
        border: `1px solid ${theme.warning}`,
      };
    case 'transfer':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        color: theme.info,
        border: `1px solid ${theme.info}`,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        color: theme.textSecondary,
        border: `1px solid ${theme.textSecondary}`,
      };
  }
};

// Función para obtener el estilo de la cantidad según el tipo de transacción
export const getQuantityStyle = (quantity: number, transactionType: string, theme: Theme) => {
  const baseStyle = {
    fontWeight: '700',
    fontSize: '1.1rem',
  };

  switch (transactionType) {
    case 'sale':
      return {
        ...baseStyle,
        color: theme.error,
      };
    case 'restock':
      return {
        ...baseStyle,
        color: theme.success,
      };
    case 'adjustment':
      return {
        ...baseStyle,
        color: theme.warning,
      };
    case 'transfer':
      return {
        ...baseStyle,
        color: theme.info,
      };
    default:
      return {
        ...baseStyle,
        color: theme.textSecondary,
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

// Exportar función para compatibilidad con código existente
export const transactionStyles = getTransactionStyles(darkTheme);
