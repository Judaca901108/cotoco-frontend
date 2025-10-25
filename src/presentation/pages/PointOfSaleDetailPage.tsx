import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaStore, FaMapMarkerAlt, FaBuilding, FaBox, FaTruck } from 'react-icons/fa';
import { detailStyles, getActionButtonStyle, getStatusBadgeStyle } from '../../shared/detailStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
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
  onDisplay: number;
};

const PointOfSaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pointOfSale, setPointOfSale] = useState<PointOfSale | null>(null);
  const [inventories, setInventories] = useState<InventorySummary[]>([]);
  const [allPointsOfSale, setAllPointsOfSale] = useState<PointOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMoveInventory, setShowMoveInventory] = useState(false);
  const [selectedTargetPoint, setSelectedTargetPoint] = useState<number>(0);
  const [movingInventory, setMovingInventory] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    // Cargar datos del punto de venta y todos los puntos de venta en paralelo
    Promise.all([
      authenticatedFetch(`${BASE_PATH}/point-of-sale/${id}`),
      authenticatedFetch(`${BASE_PATH}/point-of-sale`)
    ])
      .then(([pointResponse, allPointsResponse]) => {
        if (!pointResponse.ok) {
          throw new Error('Punto de venta no encontrado');
        }
        return Promise.all([pointResponse.json(), allPointsResponse.json()]);
      })
      .then(([pointData, allPointsData]) => {
        console.log('Punto de venta cargado:', pointData);
        console.log('Todos los puntos de venta:', allPointsData);
        setPointOfSale(pointData);
        // Filtrar el punto de venta actual de la lista
        const filteredPoints = allPointsData.filter((pos: PointOfSale) => pos.id !== parseInt(id!));
        console.log('Puntos de venta filtrados (sin el actual):', filteredPoints);
        setAllPointsOfSale(filteredPoints);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Cargar inventario del punto de venta
    authenticatedFetch(`${BASE_PATH}/point-of-sale/${id}/inventories`)
      .then((res) => res.json())
      .then(async (data) => {
        // Cargar datos individuales para obtener onDisplay correcto
        const enrichedInventories = await Promise.all(
          (data || []).map(async (inventory: any) => {
            try {
              // Cargar datos individuales para obtener onDisplay correcto
              const individualResponse = await authenticatedFetch(`${BASE_PATH}/inventory/${inventory.id}`);
              const individualData = await individualResponse.json();
              
              return {
                ...inventory,
                onDisplay: individualData.onDisplay || 0
              };
            } catch (err) {
              // Fallback a datos de la lista si falla el individual
              return {
                ...inventory,
                onDisplay: inventory.onDisplay || 0
              };
            }
          })
        );
        
        console.log('Inventarios enriquecidos:', enrichedInventories);
        setInventories(enrichedInventories);
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

    authenticatedFetch(`${BASE_PATH}/point-of-sale/${pointOfSale.id}`, { method: 'DELETE' })
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

  const handleMoveInventory = async () => {
    console.log('=== INICIANDO MOVIMIENTO DE INVENTARIO ===');
    console.log('selectedTargetPoint:', selectedTargetPoint);
    console.log('pointOfSale:', pointOfSale);
    console.log('inventories.length:', inventories.length);
    console.log('allPointsOfSale:', allPointsOfSale);
    
    if (!selectedTargetPoint || !pointOfSale) {
      console.log('Error: No hay punto de venta destino seleccionado o punto de venta actual');
      alert('Por favor selecciona un punto de venta destino');
      return;
    }

    if (inventories.length === 0) {
      console.log('Error: No hay inventario para mover');
      alert('No hay inventario para mover');
      return;
    }

    const targetPoint = allPointsOfSale.find(pos => pos.id === selectedTargetPoint);
    console.log('targetPoint encontrado:', targetPoint);
    
    if (!targetPoint) {
      console.log('Error: Punto de venta destino no válido');
      alert('Punto de venta destino no válido');
      return;
    }

    console.log('Mostrando modal de confirmación...');
    setShowConfirmModal(true);
  };

  const executeMoveInventory = async () => {
    if (!selectedTargetPoint || !pointOfSale) return;

    const targetPoint = allPointsOfSale.find(pos => pos.id === selectedTargetPoint);
    if (!targetPoint) return;

    setMovingInventory(true);
    setShowConfirmModal(false);
    
    try {
      const requestBody = {
        targetPointOfSaleId: selectedTargetPoint
      };
      console.log('Request body:', requestBody);
      console.log('URL:', `${BASE_PATH}/point-of-sale/${pointOfSale.id}/move-all-inventory`);
      
      const response = await authenticatedFetch(`${BASE_PATH}/point-of-sale/${pointOfSale.id}/move-all-inventory`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al mover inventario: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado exitoso:', result);
      
      // Mostrar resultado exitoso
      alert(`✅ Inventario movido exitosamente!\n\n` +
            `De: ${result.sourcePointOfSale.name}\n` +
            `A: ${result.targetPointOfSale.name}\n` +
            `Productos movidos: ${result.totalProductsMoved}\n` +
            `Stock total movido: ${result.totalStockMoved}\n` +
            `En exhibición movido: ${result.totalOnDisplayMoved}`);

      // Recargar la página para mostrar el inventario vacío
      console.log('Recargando página...');
      window.location.reload();
      
    } catch (err: any) {
      console.error('Error moving inventory:', err);
      alert(`Error al mover inventario: ${err.message}`);
    } finally {
      setMovingInventory(false);
      setShowMoveInventory(false);
      setSelectedTargetPoint(0);
    }
  };

  const cancelMoveInventory = () => {
    setShowConfirmModal(false);
    setMovingInventory(false);
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
          
          {inventories.length > 0 && (
            <button
              style={getActionButtonStyle('secondary')}
              onClick={() => {
                console.log('Botón MOVER INVENTARIO clickeado');
                console.log('Inventories length:', inventories.length);
                console.log('showMoveInventory actual:', showMoveInventory);
                setShowMoveInventory(!showMoveInventory);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaTruck />
              MOVER INVENTARIO
            </button>
          )}
          
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

      {/* Sección para mover inventario */}
      {showMoveInventory && (
        <div style={{
          ...detailStyles.relatedDataSection,
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          border: `2px solid ${colors.primaryColor}`,
        }}>
          <h2 style={detailStyles.relatedDataTitle}>
            <FaTruck style={{ marginRight: '8px', color: colors.primaryColor }} />
            MOVER TODO EL INVENTARIO
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px',
            backgroundColor: colors.backgroundTertiary,
            borderRadius: '8px',
            border: `1px solid ${colors.borderColor}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{
                fontWeight: '600',
                color: colors.textPrimary,
                minWidth: '120px'
              }}>
                Mover a:
              </label>
              <select
                value={selectedTargetPoint}
                onChange={(e) => setSelectedTargetPoint(parseInt(e.target.value))}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  fontSize: '0.95rem',
                }}
              >
                <option value={0}>Selecciona un punto de venta destino</option>
                {allPointsOfSale.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name} - {pos.location}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{
              fontSize: '0.9rem',
              color: colors.textSecondary,
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              padding: '12px',
              borderRadius: '6px',
              border: `1px solid rgba(255, 193, 7, 0.3)`,
            }}>
              ⚠️ <strong>Advertencia:</strong> Esta acción moverá TODO el inventario de este punto de venta al destino seleccionado. 
              Si el producto ya existe en el destino, se sumará al stock existente.
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowMoveInventory(false);
                  setSelectedTargetPoint(0);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.buttonSecondary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleMoveInventory}
                disabled={!selectedTargetPoint || movingInventory}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedTargetPoint && !movingInventory ? colors.primaryColor : colors.textSecondary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: selectedTargetPoint && !movingInventory ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {movingInventory ? '⏳ Moviendo...' : '🚚 Mover Inventario'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <th style={detailStyles.relatedTableHeaderCell}>En Exhibición</th>
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
                    <span style={{ 
                      fontWeight: '600', 
                      color: colors.primaryColor,
                      fontSize: '1.1rem'
                    }}>
                      {inventory.onDisplay}
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

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: colors.backgroundPrimary,
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${colors.borderColor}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '24px',
              }}>
                ⚠️
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.textPrimary,
              }}>
                Confirmar Movimiento de Inventario
              </h3>
            </div>

            <div style={{
              marginBottom: '24px',
              lineHeight: '1.6',
              color: colors.textSecondary,
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                ¿Estás seguro de que quieres mover <strong>TODO el inventario</strong> de:
              </p>
              <div style={{
                backgroundColor: colors.backgroundSecondary,
                padding: '16px',
                borderRadius: '8px',
                margin: '12px 0',
                border: `1px solid ${colors.borderColor}`,
              }}>
                <div style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '4px' }}>
                  📍 Origen: {pointOfSale?.name}
                </div>
                <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                  🎯 Destino: {allPointsOfSale.find(pos => pos.id === selectedTargetPoint)?.name}
                </div>
              </div>
              <p style={{ margin: '12px 0 0 0' }}>
                Esto moverá <strong>{inventories.length} productos</strong> con un total de{' '}
                <strong>{inventories.reduce((sum, inv) => sum + inv.stockQuantity, 0)} unidades</strong>.
              </p>
              <div style={{
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                border: `1px solid rgba(255, 193, 7, 0.3)`,
                borderRadius: '6px',
                padding: '12px',
                marginTop: '16px',
                fontSize: '0.9rem',
              }}>
                <strong>⚠️ Importante:</strong> Si los productos ya existen en el destino, se sumarán al stock existente.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={cancelMoveInventory}
                disabled={movingInventory}
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.buttonSecondary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: movingInventory ? 'not-allowed' : 'pointer',
                  opacity: movingInventory ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!movingInventory) {
                    e.currentTarget.style.backgroundColor = colors.hoverBackground;
                    e.currentTarget.style.color = colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!movingInventory) {
                    e.currentTarget.style.backgroundColor = colors.buttonSecondary;
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                Cancelar
              </button>
              <button
                onClick={executeMoveInventory}
                disabled={movingInventory}
                style={{
                  padding: '12px 24px',
                  backgroundColor: movingInventory ? colors.textSecondary : colors.primaryColor,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: movingInventory ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!movingInventory) {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!movingInventory) {
                    e.currentTarget.style.backgroundColor = colors.primaryColor;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {movingInventory ? (
                  <>
                    <span>⏳</span>
                    Moviendo...
                  </>
                ) : (
                  <>
                    <span>🚚</span>
                    Confirmar Movimiento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSaleDetailPage;
