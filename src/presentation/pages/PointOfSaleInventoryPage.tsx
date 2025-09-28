import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaBox, FaWarehouse } from 'react-icons/fa';
import colors from '../../shared/colors';
import InventoryForm from '../components/InventoryForm';
import ModalComponent from '../components/ModalComponent';
import { authenticatedFetch } from '../../infrastructure/authService';
import { tableStyles, getRowStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';

const BASE_PATH = 'http://localhost:3000';

type Inventory = {
  id: number;
  productId: string;
  productName: string;
  productSku: string;
  stockQuantity: number;
  minimumStock: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
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
  const navigate = useNavigate();
  
  // Función para cargar inventarios
  const loadInventories = async () => {
    if (!id) return;

    try {
      // Cargar inventarios y productos en paralelo
      const [inventoriesResponse, productsResponse] = await Promise.all([
        authenticatedFetch(`${BASE_PATH}/point-of-sale/${id}/inventories`),
        authenticatedFetch(`${BASE_PATH}/product`)
      ]);

      if (!inventoriesResponse.ok) throw new Error('Error al cargar inventarios');
      if (!productsResponse.ok) throw new Error('Error al cargar productos');

      const [inventoriesData, productsData] = await Promise.all([
        inventoriesResponse.json(),
        productsResponse.json()
      ]);

      setProducts(productsData);
      
      // Mapear inventarios para incluir información del producto
      const enrichedInventories = inventoriesData.map((inventory: any) => {
        const product = productsData.find((p: Product) => p.id === inventory.productId);
        return {
          ...inventory,
          productName: product?.name || `Producto ${inventory.productId}`,
          productSku: product?.sku || 'N/A'
        };
      });
      
      setInventories(enrichedInventories);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('No se pudieron cargar los datos.');
    }
  };

  useEffect(() => {
    loadInventories();

      authenticatedFetch(`${BASE_PATH}/point-of-sale`)
        .then((res) => res.json())
        .then((data) => setPointsOfSale(data))
        .catch((err) => console.error('Error fetching points of sale:', err));
        
  }, [id]);

  const filteredInventories = inventories.filter((inventory) =>
    inventory.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInventory = async (data: { productId: number; pointOfSaleId?: number; stockQuantity: number; minimumStock: number }) => {
    try {
      data.pointOfSaleId = parseInt(id!, 10)
      const res = await authenticatedFetch(`${BASE_PATH}/inventory`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al crear el inventario');
      
      // Recargar la lista de inventarios para obtener los datos actualizados del backend
      await loadInventories();
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const findProductById = (productId: number): Product => {
    const defaultProduct: Product = {
      id: -1,
      name: "Unknown Product",
      price: 0, 
      description: "",
      sku: "",
      category: ""
    };
  
    return products.find(({ id }) => id === productId) ?? defaultProduct;
  };

  const findPointOfSaleById = (pointOfSaleId: number): PointOfSale => {
    const defaultPointOfSale: PointOfSale = {
      id: -1,
      name: "Unknown Product", 
      address: "",
      location: "",
      type: ""
    };
  
    return pointsOfSale.find(({ id }) => id === pointOfSaleId) ?? defaultPointOfSale;
  };

  const currentPointOfSale = pointsOfSale.find(pos => pos.id === parseInt(id!));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
      <div style={tableStyles.tableContainer}>
        <table style={tableStyles.table}>
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th style={tableStyles.tableHeaderCell}>Producto</th>
              <th style={tableStyles.tableHeaderCell}>Stock Actual</th>
              <th style={tableStyles.tableHeaderCell}>Stock Mínimo</th>
              <th style={tableStyles.tableHeaderCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
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
                  <td style={tableStyles.tableCell}>
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
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaWarehouse style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                        {inventory.stockQuantity}
                      </span>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={{ color: colors.textSecondary }}>
                      {inventory.minimumStock}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell}>
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
            onSubmit={handleCreateInventory}
            onCancel={() => setIsCreating(false)}
          />
        </ModalComponent>
      )}
    </div>
  );
};

export default PointOfSaleInventoryPage;
