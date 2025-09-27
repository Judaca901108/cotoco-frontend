import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaTag, FaDollarSign, FaBarcode } from 'react-icons/fa';
import { detailStyles, getActionButtonStyle } from '../../shared/detailStyles';
import colors from '../../shared/colors';

const BASE_PATH = "http://localhost:3000";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    fetch(`${BASE_PATH}/product/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Producto no encontrado');
        }
        return res.json();
      })
      .then((data) => {
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

    fetch(`${BASE_PATH}/product/${product.id}`, { method: 'DELETE' })
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

  return (
    <div style={detailStyles.pageContainer}>
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
      <div style={detailStyles.detailHeader}>
        <h1 style={detailStyles.detailTitle}>Product: {product.name}</h1>
        <span style={detailStyles.techBadge}>Producto</span>
      </div>

      {/* Sección INFO */}
      <div style={detailStyles.infoSection}>
        <h2 style={detailStyles.infoTitle}>
          <FaBox />
          INFO
        </h2>
        
        <div style={detailStyles.infoGrid}>
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
        
        <div style={detailStyles.actionsGrid}>
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
