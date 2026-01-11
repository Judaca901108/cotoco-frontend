import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaTimes, FaCamera } from 'react-icons/fa';
import { useTheme } from '../../application/contexts/ThemeContext';

type BarcodeScannerProps = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const { theme } = useTheme();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerId = 'barcode-scanner';

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      startScanning();
    } else if (!isOpen && scannerRef.current) {
      stopScanning();
    }

    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);
      
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Código escaneado exitosamente
          onScan(decodedText);
          stopScanning();
          onClose();
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo (solo mostrar si es un error crítico)
          if (errorMessage.includes('No MultiFormat Readers')) {
            setError('No se pudo inicializar el escáner. Por favor, verifica los permisos de la cámara.');
          }
        }
      );
    } catch (err: any) {
      console.error('Error al iniciar el escáner:', err);
      setError(err.message || 'Error al acceder a la cámara. Asegúrate de dar permisos de cámara.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error al detener el escáner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    }} className="barcode-scanner-responsive">
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: theme.white,
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
          <FaCamera style={{ marginRight: '8px' }} />
          Escanear Código de Barras
        </h2>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.white,
            fontSize: '1.2rem',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <FaTimes />
        </button>
      </div>

      {/* Scanner Container */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: theme.backgroundPrimary,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }} className="barcode-scanner-container-responsive">
        {error ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: theme.error,
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600' }}>
              Error al acceder a la cámara
            </div>
            <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>
              {error}
            </div>
            <button
              onClick={handleClose}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: theme.primaryColor,
                color: theme.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div
              id={scannerId}
              style={{
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            />
            {scanning && (
              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                color: theme.textSecondary,
                fontSize: '0.9rem',
              }}>
                <div style={{ marginBottom: '8px' }}>
                  📷 Apunta la cámara al código de barras
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: `1px solid rgba(34, 197, 94, 0.3)`,
                  borderRadius: '6px',
                  color: '#16a34a',
                  fontSize: '0.85rem',
                }}>
                  Escaneando...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        maxWidth: '500px',
        textAlign: 'center',
        color: theme.textSecondary,
        fontSize: '0.9rem',
        padding: '0 20px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          💡 Asegúrate de tener buena iluminación y mantener el código de barras dentro del marco
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

