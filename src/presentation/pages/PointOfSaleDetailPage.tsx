import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaStore, FaMapMarkerAlt, FaBuilding, FaBox } from 'react-icons/fa';
import { detailStyles, getActionButtonStyle, getStatusBadgeStyle } from '../../shared/detailStyles';
import colors from '../../shared/colors';

const BASE_PATH = "http://localhost:3000";

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

type InventorySummary = {
  productId: number;
  productName: string;
  stockQuantity: number;
  minimumStock: number;
};

const PointOfSaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pointOfSale, setPointOfSale] = useState<PointOfSale | null>(null);
  const [inventories, setInventories] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    // Cargar datos del punto de venta
    fetch(`${BASE_PATH}/point-of-sale/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Punto de venta no encontrado');
        }
        return res.json();
      })
      .then((data) => {
        setPointOfSale(data);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Cargar inventario del punto de venta
    fetch(`${BASE_PATH}/point-of-sale/${id}/inventories`)
      .then((res) => res.json())
      .then((data) => {
        setInventories(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventories:', err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    if (!pointOfSale || !window.confirm('¿Estás seguro de que quieres eliminar este punto de venta?')) {
      return;
    }

    fetch(`${BASE_PATH}/point-of-sale/${pointOfSale.id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          alert('Punto de venta eliminado correctamente');
          navigate('/dashboard/point-of-sales');
        } else {
          alert('Error al eliminar el punto de venta');
        }
      })
      .catch(() => {
        alert('Error al eliminar el punto de venta');
      });
  };

  const handleEdit = () => {
    navigate(`/dashboard/point-of-sales/edit/${pointOfSale?.id}`);
  };

  const handleViewInventory = () => {
    navigate(`/dashboard/point-of-sales/${pointOfSale?.id}/inventory`);
  };

  if (loading) {
    return (
      <div style={detailStyles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.textSecondary }}>Cargando punto de venta...</div>
        </div>
      </div>
    );
  }

  if (error || !pointOfSale) {
    return (
      <div style={detailStyles.pageContainer}>
        <button
          style={detailStyles.backButton}
          onClick={() => navigate('/dashboard/point-of-sales')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonSecondary;
          }}
        >
          <FaArrowLeft />
          Volver a Puntos de Venta
        </button>
        
        <div style={detailStyles.emptyState}>
          <div style={detailStyles.emptyStateIcon}>❌</div>
          <div style={detailStyles.emptyStateTitle}>Punto de venta no encontrado</div>
          <div style={detailStyles.emptyStateDescription}>
            {error || 'El punto de venta que buscas no existe o ha sido eliminado.'}
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = inventories.length;
  const lowStockProducts = inventories.filter(inv => inv.stockQuantity < inv.minimumStock).length;

  return (
    <div style={detailStyles.pageContainer}>
      {/* Botón de regreso */}
      <button
        style={detailStyles.backButton}
        onClick={() => navigate('/dashboard/point-of-sales')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.hoverBackground;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonSecondary;
        }}
      >
        <FaArrowLeft />
        Volver a Puntos de Venta
      </button>

      {/* Header con título y badge */}
      <div style={detailStyles.detailHeader}>
        <h1 style={detailStyles.detailTitle}>Point of Sale: {pointOfSale.name}</h1>
        <span style={detailStyles.techBadge}>Tienda</span>
      </div>

      {/* Sección INFO */}
      <div style={detailStyles.infoSection}>
        <h2 style={detailStyles.infoTitle}>
          <FaStore />
          INFO
        </h2>
        
        <div style={detailStyles.infoGrid}>
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>ID</span>
            <span style={detailStyles.infoValueCode}>{pointOfSale.id}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Nombre</span>
            <span style={detailStyles.infoValue}>{pointOfSale.name}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Dirección</span>
            <span style={detailStyles.infoValue}>
              <FaMapMarkerAlt style={{ marginRight: '4px', color: colors.textSecondary }} />
              {pointOfSale.address}
            </span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Ubicación</span>
            <span style={detailStyles.infoValue}>{pointOfSale.location}</span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Tipo</span>
            <span style={detailStyles.infoValue}>
              <FaBuilding style={{ marginRight: '4px', color: colors.primaryColor }} />
              {pointOfSale.type}
            </span>
          </div>
          
          <div style={detailStyles.infoItem}>
            <span style={detailStyles.infoLabel}>Productos en Inventario</span>
            <span style={detailStyles.infoValue}>
              <FaBox style={{ marginRight: '4px', color: colors.secondaryColor }} />
              {totalProducts} productos
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
            EDITAR PUNTO DE VENTA
          </button>
          
          <button
            style={getActionButtonStyle('secondary')}
            onClick={handleViewInventory}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaBox />
            VER INVENTARIO
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
            ELIMINAR PUNTO DE VENTA
          </button>
        </div>
      </div>

      {/* Sección de inventario */}
      <div style={detailStyles.relatedDataSection}>
        <h2 style={detailStyles.relatedDataTitle}>
          INVENTARIO
          <span style={getStatusBadgeStyle(lowStockProducts > 0 ? 'warning' : 'active')}>
            {lowStockProducts > 0 ? `${lowStockProducts} con stock bajo` : 'Stock OK'}
          </span>
        </h2>
        
        {inventories.length === 0 ? (
          <div style={detailStyles.emptyState}>
            <div style={detailStyles.emptyStateIcon}>📦</div>
            <div style={detailStyles.emptyStateTitle}>Sin inventario</div>
            <div style={detailStyles.emptyStateDescription}>
              Este punto de venta no tiene productos en inventario.
            </div>
          </div>
        ) : (
          <table style={detailStyles.relatedTable}>
            <thead style={detailStyles.relatedTableHeader}>
              <tr>
                <th style={detailStyles.relatedTableHeaderCell}>Producto</th>
                <th style={detailStyles.relatedTableHeaderCell}>Stock Actual</th>
                <th style={detailStyles.relatedTableHeaderCell}>Stock Mínimo</th>
                <th style={detailStyles.relatedTableHeaderCell}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inventory) => (
                <tr key={inventory.productId} style={detailStyles.relatedTableRow}>
                  <td style={detailStyles.relatedTableCell}>
                    <div style={{ fontWeight: '600' }}>
                      {inventory.productName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                      ID: {inventory.productId}
                    </div>
                  </td>
                  <td style={detailStyles.relatedTableCell}>
                    <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                      {inventory.stockQuantity}
                    </span>
                  </td>
                  <td style={detailStyles.relatedTableCell}>
                    <span style={{ color: colors.textSecondary }}>
                      {inventory.minimumStock}
                    </span>
                  </td>
                  <td style={detailStyles.relatedTableCell}>
                    <span style={getStatusBadgeStyle(
                      inventory.stockQuantity < inventory.minimumStock ? 'warning' : 'active'
                    )}>
                      {inventory.stockQuantity < inventory.minimumStock ? 'Stock Bajo' : 'En Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PointOfSaleDetailPage;
