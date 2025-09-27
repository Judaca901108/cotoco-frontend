import colors from './colors';

export const formStyles = {
  // Contenedor principal del formulario
  formContainer: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Título del formulario
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '24px',
    textAlign: 'center' as const,
  },

  // Contenedor de campo
  fieldContainer: {
    marginBottom: '24px',
  },

  // Etiqueta del campo
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '8px',
  },

  // Input base
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none',
  },

  // Input con foco
  inputFocus: {
    borderColor: colors.primaryColor,
    boxShadow: `0 0 0 3px ${colors.primaryColor}20`,
  },

  // Input con error
  inputError: {
    borderColor: colors.error,
    boxShadow: `0 0 0 3px ${colors.error}20`,
  },

  // Textarea
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },

  // Select
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none',
    cursor: 'pointer',
  },

  // Mensaje de error
  errorMessage: {
    fontSize: '0.8rem',
    color: colors.error,
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  // Contenedor de botones
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: `1px solid ${colors.borderColor}`,
  },

  // Botón primario
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
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

  // Botón secundario
  secondaryButton: {
    backgroundColor: colors.buttonSecondary,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderColor}`,
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

  // Botón de peligro
  dangerButton: {
    backgroundColor: colors.buttonDanger,
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

  // Estados hover para botones
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  // Grid para campos en fila
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },

  // Placeholder styles
  placeholder: {
    color: colors.textMuted,
  },
};

// Función helper para aplicar estilos de hover
export const getButtonHoverStyles = (baseStyle: any) => ({
  ...baseStyle,
  ':hover': {
    ...formStyles.buttonHover,
  },
});

// Función helper para aplicar estilos de input con estado
export const getInputStyles = (hasError: boolean, isFocused: boolean = false) => {
  let style = { ...formStyles.input };
  
  if (hasError) {
    style = { ...style, ...formStyles.inputError };
  } else if (isFocused) {
    style = { ...style, ...formStyles.inputFocus };
  }
  
  return style;
};

// Función helper para aplicar estilos de textarea con estado
export const getTextareaStyles = (hasError: boolean, isFocused: boolean = false) => {
  let style = { ...formStyles.textarea };
  
  if (hasError) {
    style = { ...style, ...formStyles.inputError };
  } else if (isFocused) {
    style = { ...style, ...formStyles.inputFocus };
  }
  
  return style;
};

// Función helper para aplicar estilos de select con estado
export const getSelectStyles = (hasError: boolean, isFocused: boolean = false) => {
  let style = { ...formStyles.select };
  
  if (hasError) {
    style = { ...style, ...formStyles.inputError };
  } else if (isFocused) {
    style = { ...style, ...formStyles.inputFocus };
  }
  
  return style;
};
