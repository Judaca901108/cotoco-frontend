import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaTag, FaDollarSign, FaPrint } from 'react-icons/fa';
import Barcode from 'react-barcode';
import { getDetailStyles, getActionButtonStyle } from '../../shared/detailStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useTheme } from '../../application/contexts/ThemeContext';

import { API_BASE_URL, getImageUrl } from '../../config/apiConfig';
const BASE_PATH = API_BASE_URL;

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  imagePath?: string;
  barcode?: string; // Código de barras
  subcategory?: string; // Subcategoría
  number_of_piece?: number | string; // Número de piezas
  isActive?: boolean; // Estado activo/inactivo
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const detailStyles = getDetailStyles(theme);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    authenticatedFetch(`${BASE_PATH}/product/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Producto no encontrado');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Datos del producto recibidos:', data);
        console.log('Imagen del producto:', data.imagePath);
        console.log('URL completa de la imagen:', data.imagePath ? getImageUrl(data.imagePath) : 'No hay imagen');
        
        setProduct({
          ...data,
          price: parseFloat(data.price),
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    if (!product || !window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    authenticatedFetch(`${BASE_PATH}/product/${product.id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          alert('Producto eliminado correctamente');
          navigate('/dashboard/products');
        } else {
          alert('Error al eliminar el producto');
        }
      })
      .catch(() => {
        alert('Error al eliminar el producto');
      });
  };

  const handleEdit = () => {
    navigate(`/dashboard/products/edit/${product?.id}`);
  };

  const handleToggleStatus = async () => {
    if (!product || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const newStatus = !product.isActive;
      const response = await authenticatedFetch(`${BASE_PATH}/product/${product.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar el estado del producto: ${response.status} - ${errorText}`);
      }

      setProduct({
        ...product,
        isActive: newStatus,
      });
    } catch (err: any) {
      console.error('Error updating product status:', err);
      setError(err.message || 'Error al actualizar el estado del producto');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={detailStyles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: theme.textSecondary }}>Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={detailStyles.pageContainer}>
        <button
          style={detailStyles.backButton}
          onClick={() => navigate('/dashboard/products')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.buttonSecondary;
          }}
        >
          <FaArrowLeft />
          Volver a Productos
        </button>
        
        <div style={detailStyles.emptyState}>
          <div style={detailStyles.emptyStateIcon}>❌</div>
          <div style={detailStyles.emptyStateTitle}>Producto no encontrado</div>
          <div style={detailStyles.emptyStateDescription}>
            {error || 'El producto que buscas no existe o ha sido eliminado.'}
          </div>
        </div>
      </div>
    );
  }

  // Debug: verificar el estado del producto antes del render
  console.log('Producto en render:', product);
  console.log('¿Tiene imagen?', product?.imagePath);
  console.log('URL de imagen en render:', product?.imagePath ? getImageUrl(product.imagePath) : 'No hay imagen');

  return (
    <div style={detailStyles.pageContainer} className="page-container-responsive">
      {/* Botón de regreso */}
      <button
        style={detailStyles.backButton}
        onClick={() => navigate('/dashboard/products')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.hoverBackground;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.buttonSecondary;
        }}
      >
        <FaArrowLeft />
        Volver a Productos
      </button>

      {/* Header con título y badge */}
      <div style={{
        ...detailStyles.detailHeader,
        justifyContent: 'center',
        marginBottom: '40px',
      }} className="detail-header-responsive">
        <h1 style={detailStyles.detailTitle} className="detail-title-responsive">{product.name}</h1>
        <span style={detailStyles.techBadge}>Producto</span>
      </div>

      {/* Sección INFO */}
      <div style={{
        ...detailStyles.infoSection,
        maxWidth: '1200px',
        margin: '0 auto 24px auto',
      }}>
        <h2 style={detailStyles.infoTitle}>
          <FaBox />
          INFO
        </h2>
        
        {/* Layout principal: Imagen más grande y mejor distribuida */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '50px',
          alignItems: 'start',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Columna de imagen */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'sticky',
            top: '20px',
            height: 'fit-content',
            gap: '20px',
          }}>
              <div style={{
                border: `3px solid ${theme.borderColor}`,
                borderRadius: '20px',
                padding: '30px',
                backgroundColor: theme.backgroundTertiary,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
              }}>
                {/* Efecto de brillo sutil */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
                  opacity: 0.6,
                }} />
                
                <img
                  src={product.imagePath ? getImageUrl(product.imagePath) : '/images/image-default.png'}
                  alt={product.name || 'Producto'}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    opacity: 1,
                    transition: 'transform 0.3s ease',
                    display: 'block',
                  }}
                  onLoad={(e) => {
                    console.log('Imagen cargada correctamente:', e.currentTarget.src);
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    console.error('Error al cargar la imagen:', e.currentTarget.src);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQ1MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0NTAiIGhlaWdodD0iMzAwIiBmaWxsPSIjM0EzQTNBIi8+CjxwYXRoIGQ9Ik0yMjUgMTUwTDE4MCAxMTVMMjcwIDExNUwyMjUgMTUwWiIgZmlsbD0iIzcxNzE3QSIvPgo8Y2lyY2xlIGN4PSIyMjUiIGN5PSIxNTAiIHI9IjMwIiBmaWxsPSIjNzE3MTdBIi8+Cjwvc3ZnPg==';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
              
            {/* Status */}
            <div style={{
              width: '100%',
              maxWidth: '500px',
              textAlign: 'center',
              padding: '16px 24px',
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: product.isActive ? theme.success : theme.error,
                boxShadow: `0 0 8px ${product.isActive ? theme.success : theme.error}`,
              }} />
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: theme.textPrimary,
              }}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Columna de información - 2 columnas */}
          <div style={{
            ...detailStyles.infoGrid,
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }} className="info-grid-responsive">
            {/* Primera fila: ID, SKU */}
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>ID</span>
              <span style={detailStyles.infoValueCode}>{product.id}</span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>SKU</span>
              <span style={detailStyles.infoValueCode}>{product.sku}</span>
            </div>
            
            {/* Segunda fila: Categoría, Subcategoría */}
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Categoría</span>
              <span style={detailStyles.infoValue}>
                <FaTag style={{ marginRight: '4px', color: theme.primaryColor }} />
                {product.category}
              </span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Subcategoría</span>
              <span style={detailStyles.infoValue}>
                {product.subcategory || 'N/A'}
              </span>
            </div>
            
            {/* Tercera fila: Número de piezas, Precio */}
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Número de Piezas</span>
              <span style={detailStyles.infoValue}>
                {product.number_of_piece ? String(product.number_of_piece) : 'N/A'}
              </span>
            </div>
            
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Precio</span>
              <span style={detailStyles.infoValue}>
                <FaDollarSign style={{ marginRight: '4px', color: theme.success }} />
                {product.price.toFixed(2)}
              </span>
            </div>
            
            {/* Descripción - ocupa todo el ancho */}
            <div style={{
              ...detailStyles.infoItem,
              gridColumn: '1 / -1',
            }}>
              <span style={detailStyles.infoLabel}>Descripción</span>
              <span style={detailStyles.infoValue}>{product.description}</span>
            </div>
            
            {product.barcode && (
              <div style={{
                ...detailStyles.infoItem,
                gridColumn: '1 / -1',
                marginTop: '8px',
              }}>
                <span style={detailStyles.infoLabel}>Código de Barras</span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '24px',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  width: '100%',
                  overflow: 'hidden',
                }} id="barcode-print-section">
                <div style={{
                  backgroundColor: theme.white,
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'inline-block',
                    }}
                    className="barcode-wrapper"
                    >
                      <style>{`
                        .barcode-wrapper svg {
                          width: auto !important;
                          height: 60px !important;
                          max-width: 100% !important;
                          display: block !important;
                        }
                      `}</style>
                      <Barcode
                        value={product.barcode}
                        format="CODE128"
                        width={1}
                        height={60}
                        displayValue={true}
                        fontSize={12}
                        margin={5}
                      />
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: theme.textSecondary,
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    marginTop: '4px',
                    wordBreak: 'break-all',
                    textAlign: 'center',
                    maxWidth: '100%',
                    padding: '0 10px',
                  }}>
                    {product.barcode}
                  </div>
                </div>
                  
                  <button
                    onClick={() => {
                      const printContent = document.getElementById('barcode-print-section');
                      if (printContent) {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Código de Barras - ${product.name}</title>
                                <style>
                                  @media print {
                                    body { margin: 0; padding: 20px; }
                                    @page { margin: 0; size: auto; }
                                  }
                                  body {
                                    font-family: Arial, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    margin: 0;
                                    padding: 20px;
                                  }
                                  .product-name {
                                    font-size: 1.2rem;
                                    font-weight: 600;
                                    margin-bottom: 8px;
                                    text-align: center;
                                  }
                                  .product-sku {
                                    font-size: 0.9rem;
                                    color: #666;
                                    margin-bottom: 16px;
                                    text-align: center;
                                  }
                                  .barcode-container {
                                    background: white;
                                    padding: 24px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    gap: 12px;
                                  }
                                  .barcode-text {
                                    font-size: 0.85rem;
                                    color: #666;
                                    font-family: monospace;
                                    letter-spacing: 2px;
                                    margin-top: 8px;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="product-name">${product.name}</div>
                                <div class="product-sku">SKU: ${product.sku}</div>
                                <div class="barcode-container">
                                  ${printContent.innerHTML}
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          setTimeout(() => {
                            printWindow.print();
                          }, 250);
                        }
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: theme.primaryColor,
                      color: theme.white,
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c3aed';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primaryColor;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <FaPrint />
                    Imprimir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sección de acciones */}
      <div style={{
        ...detailStyles.actionsSection,
        maxWidth: '1200px',
        margin: '0 auto 24px auto',
      }}>
        <h2 style={detailStyles.actionsTitle}>ACCIONES</h2>
        
        <div style={{
          ...detailStyles.actionsGrid,
          justifyContent: 'center',
        }} className="actions-grid-responsive">
          <button
            style={getActionButtonStyle('primary', theme)}
            onClick={handleEdit}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaEdit />
            EDITAR PRODUCTO
          </button>
          
          <button
            style={getActionButtonStyle('danger', theme)}
            onClick={handleDelete}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaTrash />
            ELIMINAR PRODUCTO
          </button>
          
          <button
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            style={{
              ...getActionButtonStyle('primary', theme),
              backgroundColor: product?.isActive ? theme.error : theme.success,
              opacity: isUpdatingStatus ? 0.7 : 1,
              cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isUpdatingStatus) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.backgroundColor = product?.isActive ? '#dc2626' : '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingStatus) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = product?.isActive ? theme.error : theme.success;
              }
            }}
          >
            {isUpdatingStatus 
              ? 'Actualizando...' 
              : product?.isActive 
                ? 'DESHABILITAR PRODUCTO' 
                : 'HABILITAR PRODUCTO'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductDetailPage;
