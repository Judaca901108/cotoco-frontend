import React from 'react';
import colors from '../../shared/colors';

type ButtonProps = {
  text: string;
  onClick: () => void;
};

const ButtonComponent: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: colors.headerButtonBackground,
        color: colors.headerButtonText,
        border: `2px solid ${colors.headerText}`,
        borderRadius: '5px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '1rem',
        textTransform: 'uppercase',
      }}
    >
      {text}
    </button>
  );
};

export default ButtonComponent;
