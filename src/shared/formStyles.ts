import { Theme, darkTheme } from './themeColors';

// Función que genera los estilos de formulario basados en el tema
export const getFormStyles = (theme: Theme) => ({
  // Contenedor principal del formulario
  formContainer: {
    backgroundColor: theme.cardBackground,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },

  // Título del formulario
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.textPrimary,
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
    color: theme.textPrimary,
    marginBottom: '8px',
  },

  // Input base
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: theme.backgroundSecondary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '8px',
    color: theme.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none',
  },

  // Input con foco
  inputFocus: {
    borderColor: theme.primaryColor,
    boxShadow: `0 0 0 3px ${theme.primaryColor}20`,
  },

  // Input con error
  inputError: {
    borderColor: theme.error,
    boxShadow: `0 0 0 3px ${theme.error}20`,
  },

  // Textarea
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: theme.backgroundSecondary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '8px',
    color: theme.textPrimary,
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
    backgroundColor: theme.backgroundSecondary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '8px',
    color: theme.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none',
    cursor: 'pointer',
  },

  // Mensaje de error
  errorMessage: {
    fontSize: '0.8rem',
    color: theme.error,
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
    borderTop: `1px solid ${theme.borderColor}`,
  },

  // Botón primario
  primaryButton: {
    backgroundColor: theme.buttonPrimary,
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

  // Botón secundario
  secondaryButton: {
    backgroundColor: theme.buttonSecondary,
    color: theme.textPrimary,
    border: `1px solid ${theme.borderColor}`,
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
    backgroundColor: theme.buttonDanger,
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

  // Estados hover para botones
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  // Grid para campos en fila
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  // Placeholder styles
  placeholder: {
    color: theme.textMuted,
  },
});

// Función helper para aplicar estilos de hover
export const getButtonHoverStyles = (baseStyle: any, theme: Theme) => ({
  ...baseStyle,
  ':hover': {
    ...getFormStyles(theme).buttonHover,
  },
});

// Función helper para aplicar estilos de input con estado
export const getInputStyles = (hasError: boolean, isFocused: boolean = false, theme: Theme) => {
  const styles = getFormStyles(theme);
  let style = { ...styles.input };
  
  if (hasError) {
    style = { ...style, ...styles.inputError };
  } else if (isFocused) {
    style = { ...style, ...styles.inputFocus };
  }
  
  return style;
};

// Función helper para aplicar estilos de textarea con estado
export const getTextareaStyles = (hasError: boolean, isFocused: boolean = false, theme: Theme) => {
  const styles = getFormStyles(theme);
  let style = { ...styles.textarea };
  
  if (hasError) {
    style = { ...style, ...styles.inputError };
  } else if (isFocused) {
    style = { ...style, ...styles.inputFocus };
  }
  
  return style;
};

// Función helper para aplicar estilos de select con estado
export const getSelectStyles = (hasError: boolean, isFocused: boolean = false, theme: Theme) => {
  const styles = getFormStyles(theme);
  let style = { ...styles.select };
  
  if (hasError) {
    style = { ...style, ...styles.inputError };
  } else if (isFocused) {
    style = { ...style, ...styles.inputFocus };
  }
  
  return style;
};

// Exportar función para compatibilidad con código existente
export const formStyles = getFormStyles(darkTheme);
