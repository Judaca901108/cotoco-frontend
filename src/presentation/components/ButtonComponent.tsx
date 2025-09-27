import React from 'react';
import { formStyles } from '../../shared/formStyles';

type ButtonProps = {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
};

const ButtonComponent: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon
}) => {
  const getButtonStyle = () => {
    let baseStyle: any = { ...formStyles.primaryButton };
    
    switch (variant) {
      case 'secondary':
        baseStyle = { ...formStyles.secondaryButton };
        break;
      case 'danger':
        baseStyle = { ...formStyles.dangerButton };
        break;
      default:
        baseStyle = { ...formStyles.primaryButton };
    }

    // Ajustar tamaño
    switch (size) {
      case 'small':
        baseStyle.padding = '8px 16px';
        baseStyle.fontSize = '0.9rem';
        break;
      case 'large':
        baseStyle.padding = '16px 32px';
        baseStyle.fontSize = '1.1rem';
        break;
      default:
        baseStyle.padding = '12px 24px';
        baseStyle.fontSize = '1rem';
    }

    // Estado deshabilitado
    if (disabled) {
      baseStyle.opacity = '0.6';
      baseStyle.cursor = 'not-allowed';
    }

    return baseStyle;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={getButtonStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {icon && <span style={{ marginRight: icon ? '8px' : '0' }}>{icon}</span>}
      {text}
    </button>
  );
};

export default ButtonComponent;
