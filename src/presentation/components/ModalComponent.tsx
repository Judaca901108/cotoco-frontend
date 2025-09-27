import React from 'react';
import { FaTimes } from 'react-icons/fa';
import colors from '../../shared/colors';

type ModalComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        maxWidth: '800px',
        maxHeight: '90vh',
        width: '100%',
        border: `1px solid ${colors.borderColor}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: `1px solid ${colors.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.backgroundTertiary,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.textPrimary,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textSecondary,
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBackground;
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '30px',
          backgroundColor: colors.backgroundSecondary,
          maxHeight: 'calc(90vh - 100px)',
          overflow: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
