import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaTag, FaDollarSign } from 'react-icons/fa';
import { detailStyles, getActionButtonStyle } from '../../shared/detailStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import colors from '../../shared/colors';

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
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          price: parseFloat(data.price)
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

  if (loading) {
    return (
      <div style={detailStyles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.textSecondary }}>Cargando producto...</div>
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
            e.currentTarget.style.backgroundColor = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonSecondary;
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
          e.currentTarget.style.backgroundColor = colors.hoverBackground;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonSecondary;
        }}
      >
        <FaArrowLeft />
        Volver a Productos
      </button>

      {/* Header con título y badge */}
      <div style={detailStyles.detailHeader} className="detail-header-responsive">
        <h1 style={detailStyles.detailTitle} className="detail-title-responsive">Product: {product.name}</h1>
        <span style={detailStyles.techBadge}>Producto</span>
      </div>

      {/* Sección INFO */}
      <div style={detailStyles.infoSection}>
        <h2 style={detailStyles.infoTitle}>
          <FaBox />
          INFO
        </h2>
        
        {/* Layout principal: Imagen más grande y mejor distribuida */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: product.imagePath ? '1fr 1.5fr' : '1fr',
          gap: '50px',
          alignItems: 'start',
        }}>
          {/* Columna de imagen */}
          {product.imagePath ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'sticky',
              top: '20px',
            }}>
              <div style={{
                border: `3px solid ${colors.borderColor}`,
                borderRadius: '20px',
                padding: '30px',
                backgroundColor: colors.backgroundTertiary,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Efecto de brillo sutil */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${colors.primaryColor}, transparent)`,
                  opacity: 0.6,
                }} />
                
                <img
                  src={getImageUrl(product.imagePath)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    maxWidth: '450px',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    opacity: 1,
                    transition: 'transform 0.3s ease',
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
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
              
              {/* Información adicional de la imagen */}
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: '1rem',
                padding: '16px 24px',
                backgroundColor: colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${colors.borderColor}`,
                width: '100%',
                maxWidth: '500px',
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: colors.textPrimary,
                  fontSize: '1.1rem',
                }}>
                  📸 Imagen del Producto
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  opacity: 0.8,
                }}>
                  {product.name}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 40px',
              border: `3px dashed ${colors.borderColor}`,
              borderRadius: '20px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.textSecondary,
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '20px',
                opacity: 0.6,
              }}>
                📦
              </div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: colors.textPrimary,
              }}>
                Sin Imagen
              </div>
              <div style={{ 
                fontSize: '1rem', 
                textAlign: 'center',
                opacity: 0.8,
                lineHeight: '1.5',
              }}>
                Este producto no tiene imagen asociada
              </div>
            </div>
          )}

          {/* Columna de información */}
          <div style={detailStyles.infoGrid} className="info-grid-responsive">
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>ID</span>
            <span style={detailStyles.infoValueCode}>{product.id}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Nombre</span>
            <span style={detailStyles.infoValue}>{product.name}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Descripción</span>
            <span style={detailStyles.infoValue}>{product.description}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Precio</span>
            <span style={detailStyles.infoValue}>
              <FaDollarSign style={{ marginRight: '4px', color: colors.success }} />
              {product.price.toFixed(2)}
            </span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>SKU</span>
            <span style={detailStyles.infoValueCode}>{product.sku}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Categoría</span>
            <span style={detailStyles.infoValue}>
              <FaTag style={{ marginRight: '4px', color: colors.primaryColor }} />
              {product.category}
            </span>
          </div>
          
          {product.barcode && (
            <div style={detailStyles.infoItem}>
              <span style={detailStyles.infoLabel}>Código de Barras</span>
              <span style={detailStyles.infoValueCode}>{product.barcode}</span>
            </div>
          )}
        </div>
        </div>

        {/* Checkboxes */}
        <div style={detailStyles.checkboxContainer}>
          <input
            type="checkbox"
            id="active"
            style={detailStyles.checkbox}
            defaultChecked={true}
          />
          <label htmlFor="active" style={detailStyles.checkboxLabel}>
            Activo
          </label>
        </div>
      </div>

      {/* Sección de acciones */}
      <div style={detailStyles.actionsSection}>
        <h2 style={detailStyles.actionsTitle}>ACCIONES</h2>
        
        <div style={detailStyles.actionsGrid} className="actions-grid-responsive">
          <button
            style={getActionButtonStyle('primary')}
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
            style={getActionButtonStyle('danger')}
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
        </div>
      </div>

    </div>
  );
};

export default ProductDetailPage;
