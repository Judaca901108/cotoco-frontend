import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaBox, FaWarehouse, FaEye, FaEdit, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import colors from '../../shared/colors';
import InventoryForm from '../components/InventoryForm';
import ModalComponent from '../components/ModalComponent';
import { authenticatedFetch } from '../../infrastructure/authService';
import { tableStyles, getRowStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';

import { API_BASE_URL } from '../../config/apiConfig';
const BASE_PATH = API_BASE_URL;

type Inventory = {
  id: number;
  productId: string;
  productName: string;
  productSku: string;
  stockQuantity: number;
  minimumStock: number;
  onDisplay: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
  barcode?: string; // Código de barras
};

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

const PointOfSaleInventoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [editingDisplay, setEditingDisplay] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState('');
  const [editingMinimumStock, setEditingMinimumStock] = useState<number | null>(null);
  const [minimumStockValue, setMinimumStockValue] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  
  // Función para cargar inventarios
  const loadInventories = useCallback(async () => {
    if (!id) return;

    try {
      // Construir URL con parámetros de ordenamiento
      // El endpoint correcto es /inventory con pointOfSaleId como parámetro
      const params = new URLSearchParams();
      params.append('pointOfSaleId', id);
      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('order', order);
      }
      const inventoriesUrl = `${BASE_PATH}/inventory?${params.toString()}`;
      
      // Cargar inventarios y productos en paralelo
      const [inventoriesResponse, productsResponse] = await Promise.all([
        authenticatedFetch(inventoriesUrl),
        authenticatedFetch(`${BASE_PATH}/product`)
      ]);

      if (!inventoriesResponse.ok) {
        const errorText = await inventoriesResponse.text();
        throw new Error(`Error al cargar inventarios: ${inventoriesResponse.status} - ${errorText}`);
      }
      
      if (!productsResponse.ok) {
        const errorText = await productsResponse.text();
        throw new Error(`Error al cargar productos: ${productsResponse.status} - ${errorText}`);
      }

      const [inventoriesData, productsData] = await Promise.all([
        inventoriesResponse.json(),
        productsResponse.json()
      ]);

      setProducts(productsData);
      
      // Cargar datos individuales para obtener onDisplay correcto
      const enrichedInventories = await Promise.all(
        inventoriesData.map(async (inventory: any) => {
          try {
            // Cargar datos individuales para obtener onDisplay correcto
            const individualResponse = await authenticatedFetch(`${BASE_PATH}/inventory/${inventory.id}`);
            const individualData = await individualResponse.json();
            
            const product = productsData.find((p: Product) => p.id === inventory.productId);
            return {
              ...inventory,
              productName: product?.name || `Producto ${inventory.productId}`,
              productSku: product?.sku || 'N/A',
              // Usar onDisplay del endpoint individual (correcto)
              onDisplay: individualData.onDisplay || 0
            };
          } catch (err) {
            // Fallback a datos de la lista si falla el individual
            const product = productsData.find((p: Product) => p.id === inventory.productId);
            return {
              ...inventory,
              productName: product?.name || `Producto ${inventory.productId}`,
              productSku: product?.sku || 'N/A',
              onDisplay: inventory.onDisplay || 0
            };
          }
        })
      );
      
      setInventories(enrichedInventories);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Error: ${err.message}`);
    }
  }, [id, sortBy, order]);
  
  useEffect(() => {
    loadInventories();

      authenticatedFetch(`${BASE_PATH}/point-of-sale`)
        .then((res) => res.json())
        .then((data) => setPointsOfSale(data))
        .catch((err) => console.error('Error fetching points of sale:', err));
        
  }, [id, loadInventories]);

  const filteredInventories = inventories.filter((inventory) =>
    inventory.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInventory = async (data: { productId: number; pointOfSaleId?: number; stockQuantity: number; minimumStock: number; onDisplay: number }) => {
    try {
      const inventoryData = {
        productId: data.productId,
        pointOfSaleId: parseInt(id!, 10),
        stockQuantity: data.stockQuantity,
        minimumStock: data.minimumStock,
        onDisplay: data.onDisplay
      };
      
      const res = await authenticatedFetch(`${BASE_PATH}/inventory`, {
        method: 'POST',
        body: JSON.stringify(inventoryData),
      });
      if (!res.ok) throw new Error('Error al crear el inventario');
      
      // Recargar la lista de inventarios para obtener los datos actualizados del backend
      await loadInventories();
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateDisplay = async (inventoryId: number, newDisplayValue: number) => {
    try {
      // Validar que el valor sea válido
      if (isNaN(newDisplayValue) || newDisplayValue < 0) {
        setError('La cantidad debe ser un número válido mayor o igual a 0');
        return;
      }

      const res = await authenticatedFetch(`${BASE_PATH}/inventory/${inventoryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ onDisplay: newDisplayValue }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar: ${res.status} - ${errorText}`);
      }
      
      // Recargar la lista de inventarios
      await loadInventories();
      setEditingDisplay(null);
      setDisplayValue('');
      setError(''); // Limpiar errores previos
    } catch (err: any) {
      console.error('Error en handleUpdateDisplay:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const startEditingDisplay = (inventory: Inventory) => {
    setEditingDisplay(inventory.id);
    setDisplayValue(inventory.onDisplay.toString());
    setError(''); // Limpiar errores previos
  };

  const cancelEditingDisplay = () => {
    setEditingDisplay(null);
    setDisplayValue('');
    setError(''); // Limpiar errores previos
  };

  const handleUpdateMinimumStock = async (inventoryId: number, newMinimumStockValue: number) => {
    try {
      // Validar que el valor sea válido
      if (isNaN(newMinimumStockValue) || newMinimumStockValue < 0) {
        setError('El stock mínimo debe ser un número válido mayor o igual a 0');
        return;
      }

      const res = await authenticatedFetch(`${BASE_PATH}/inventory/${inventoryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ minimumStock: newMinimumStockValue }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar: ${res.status} - ${errorText}`);
      }
      
      // Recargar la lista de inventarios
      await loadInventories();
      setEditingMinimumStock(null);
      setMinimumStockValue('');
      setError(''); // Limpiar errores previos
    } catch (err: any) {
      console.error('Error en handleUpdateMinimumStock:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const startEditingMinimumStock = (inventory: Inventory) => {
    setEditingMinimumStock(inventory.id);
    setMinimumStockValue(inventory.minimumStock.toString());
    setError(''); // Limpiar errores previos
  };

  const cancelEditingMinimumStock = () => {
    setEditingMinimumStock(null);
    setMinimumStockValue('');
    setError(''); // Limpiar errores previos
  };

  // Manejar ordenamiento
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Si ya está ordenado por esta columna, cambiar el orden
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una nueva columna, ordenar ascendente por defecto
      setSortBy(column);
      setOrder('asc');
    }
  };

  // Obtener icono de ordenamiento
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <FaSort style={{ marginLeft: '4px', opacity: 0.3 }} />;
    }
    return order === 'asc' 
      ? <FaSortUp style={{ marginLeft: '4px', color: colors.primaryColor }} />
      : <FaSortDown style={{ marginLeft: '4px', color: colors.primaryColor }} />;
  };



  const currentPointOfSale = pointsOfSale.find(pos => pos.id === parseInt(id!));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }} className="page-container-responsive">
      {/* Botón de regreso */}
      <button
        onClick={() => navigate(`/dashboard/point-of-sales/${id}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: colors.buttonSecondary,
          color: colors.textSecondary,
          border: `1px solid ${colors.borderColor}`,
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '30px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.hoverBackground;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonSecondary;
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        <FaArrowLeft />
        Volver al Punto de Venta
      </button>

      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <FaWarehouse style={{ color: colors.primaryColor }} />
          Inventario - {currentPointOfSale?.name || 'Cargando...'}
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          margin: 0,
        }}>
          Gestiona el inventario de productos en este punto de venta
        </p>
      </div>

      {/* Barra de herramientas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <FaSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textSecondary,
            fontSize: '0.9rem',
          }} />
        <input
          type="text"
          placeholder="Buscar por nombre del producto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              fontSize: '1rem',
              backgroundColor: colors.backgroundTertiary,
              border: `1px solid ${colors.borderColor}`,
              borderRadius: '8px',
              color: colors.textPrimary,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primaryColor;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.borderColor;
            }}
          />
        </div>

        {/* Botón crear */}
        <button
          onClick={() => setIsCreating(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.primaryColor,
            color: colors.white,
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
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
          <FaPlus />
          Agregar Producto
        </button>
        
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: colors.error,
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* Tabla de inventario */}
      <div style={tableStyles.tableContainer} className="table-container-responsive">
        <table style={tableStyles.table} className="table-responsive">
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('product')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Producto
                  {getSortIcon('product')}
                </div>
              </th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('stockQuantity')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Stock Actual
                  {getSortIcon('stockQuantity')}
                </div>
              </th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Stock Mínimo</th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">En Exhibición</th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('status')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Estado
                  {getSortIcon('status')}
                </div>
              </th>
          </tr>
        </thead>
        <tbody>
            {filteredInventories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  ...tableStyles.tableCell,
                  textAlign: 'center',
                  padding: '40px',
                  color: colors.textSecondary,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <FaBox style={{ fontSize: '2rem', opacity: 0.5 }} />
                    <div>
                      {searchQuery ? 'No se encontraron productos' : 'No hay productos en el inventario'}
                    </div>
                    {!searchQuery && (
                      <button
                        onClick={() => setIsCreating(true)}
                style={{
                          backgroundColor: colors.primaryColor,
                          color: colors.white,
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                        }}
                      >
                        Agregar primer producto
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredInventories.map((inventory, index) => (
                <tr key={inventory.id} style={getRowStyle(index, false)}>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={getTechIconStyle('gradle')}>
                        <FaBox />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                          {inventory.productName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                          SKU: {inventory.productSku} • ID: {inventory.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaWarehouse style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                        {inventory.stockQuantity}
                      </span>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    {editingMinimumStock === inventory.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={minimumStockValue}
                          onChange={(e) => setMinimumStockValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateMinimumStock(inventory.id, parseInt(minimumStockValue));
                            }
                          }}
                          style={{
                            width: '80px',
                            padding: '6px 8px',
                            border: `2px solid ${colors.primaryColor}`,
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textAlign: 'center',
                            backgroundColor: colors.backgroundTertiary,
                          }}
                          min="0"
                          placeholder="0"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateMinimumStock(inventory.id, parseInt(minimumStockValue))}
                          style={{
                            backgroundColor: '#10b981',
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✓ Guardar
                        </button>
                        <button
                          onClick={cancelEditingMinimumStock}
                          style={{
                            backgroundColor: '#ef4444',
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: colors.textPrimary, fontWeight: '600', fontSize: '1rem' }}>
                {inventory.minimumStock}
                    </span>
                        <button
                          onClick={() => startEditingMinimumStock(inventory)}
                          style={{
                            backgroundColor: colors.primaryColor,
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#7c3aed';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primaryColor;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          <FaEdit />
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    {editingDisplay === inventory.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={displayValue}
                          onChange={(e) => setDisplayValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateDisplay(inventory.id, parseInt(displayValue));
                            }
                          }}
                          style={{
                            width: '80px',
                            padding: '6px 8px',
                            border: `2px solid ${colors.primaryColor}`,
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textAlign: 'center',
                            backgroundColor: colors.backgroundTertiary,
                          }}
                          min="0"
                          max={inventory.stockQuantity}
                          placeholder="0"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateDisplay(inventory.id, parseInt(displayValue))}
                          style={{
                            backgroundColor: '#10b981',
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✓ Guardar
                        </button>
                        <button
                          onClick={cancelEditingDisplay}
                          style={{
                            backgroundColor: '#ef4444',
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: colors.textPrimary, fontWeight: '600', fontSize: '1.2rem' }}>
                          {inventory.onDisplay}
                        </span>
                        <button
                          onClick={() => startEditingDisplay(inventory)}
                          style={{
                            backgroundColor: colors.primaryColor,
                            color: colors.white,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#7c3aed';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primaryColor;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          <FaEye />
                          Editar Exhibición
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={getStatusBadgeStyle(
                      inventory.stockQuantity <= inventory.minimumStock ? 'inactive' : 'active'
                    )}>
                      {inventory.stockQuantity <= inventory.minimumStock ? 'Stock Bajo' : 'Stock OK'}
                    </span>
                  </td>
                </tr>
              ))
            )}
        </tbody>
      </table>
      </div>

      {/* Modal para crear inventario */}
      {isCreating && (
        <ModalComponent
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Agregar Producto al Inventario"
        >
          <InventoryForm
            products={products}
            pointOfSaleId={parseInt(id!, 10)}
            onSubmit={handleCreateInventory}
            onCancel={() => setIsCreating(false)}
          />
        </ModalComponent>
      )}
    </div>
  );
};

export default PointOfSaleInventoryPage;
