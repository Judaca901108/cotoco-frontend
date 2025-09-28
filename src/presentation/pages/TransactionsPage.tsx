import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaBox, FaStore, FaArrowRight } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import TransactionForm from '../components/TransactionForm';
import { transactionStyles, getTransactionTypeStyle, getQuantityStyle, getTransactionIcon, getTransactionTypeLabel } from '../../shared/transactionStyles';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type Transaction = {
  id: number;
  inventoryId: number;
  transactionType: 'sale' | 'restock' | 'adjustment' | 'transfer';
  quantity: number;
  remarks: string;
  createdAt: string;
  sourcePointOfSaleId?: number;
  destinationPointOfSaleId?: number;
  // Información relacionada
  productName?: string;
  productSku?: string;
  pointOfSaleName?: string;
  sourcePointOfSaleName?: string;
  destinationPointOfSaleName?: string;
};

type Inventory = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  pointOfSaleId: number;
  pointOfSaleName: string;
  stockQuantity: number;
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar transacciones
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_PATH}/inventory-transaction`);
        if (!response.ok) throw new Error('Error al cargar transacciones');
        const data = await response.json();

        // Enriquecer transacciones con nombres de productos y puntos de venta
        const [productsResponse, pointsOfSaleResponse] = await Promise.all([
          fetch(`${BASE_PATH}/product`),
          fetch(`${BASE_PATH}/point-of-sale`)
        ]);

        const productsData = await productsResponse.json();
        const pointsOfSaleData = await pointsOfSaleResponse.json();

        const enrichedTransactions = data.map((transaction: any) => {
          const product = productsData.find((p: any) => p.id === transaction.productId);
          const pointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.pointOfSaleId);
          const sourcePointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.sourcePointOfSaleId);
          const destinationPointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.destinationPointOfSaleId);

          return {
            ...transaction,
            productName: product?.name || `Producto ${transaction.productId}`,
            productSku: product?.sku || 'N/A',
            pointOfSaleName: pointOfSale?.name || `Punto de Venta ${transaction.pointOfSaleId}`,
            sourcePointOfSaleName: sourcePointOfSale?.name || `Punto de Venta ${transaction.sourcePointOfSaleId}`,
            destinationPointOfSaleName: destinationPointOfSale?.name || `Punto de Venta ${transaction.destinationPointOfSaleId}`,
          };
        });

        setTransactions(enrichedTransactions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Función para cargar inventarios
  const loadInventories = async () => {
    try {
      // Cargar inventarios y productos en paralelo
      const [inventoriesResponse, productsResponse] = await Promise.all([
        fetch(`${BASE_PATH}/inventory`),
        fetch(`${BASE_PATH}/product`)
      ]);

      if (!inventoriesResponse.ok) throw new Error('Error al cargar inventarios');
      if (!productsResponse.ok) throw new Error('Error al cargar productos');

      const [inventoriesData, productsData] = await Promise.all([
        inventoriesResponse.json(),
        productsResponse.json()
      ]);

      // Enriquecer inventarios con información del producto
      const enrichedInventories = inventoriesData.map((inventory: any) => {
        const product = productsData.find((p: any) => p.id === inventory.productId);
        return {
          ...inventory,
          productName: product?.name || `Producto ${inventory.productId}`,
          productSku: product?.sku || 'N/A'
        };
      });

      setInventories(enrichedInventories);
    } catch (err: any) {
      console.error('Error loading inventories:', err);
    }
  };

  // Cargar inventarios para el formulario
  useEffect(() => {
    loadInventories();
  }, []);

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.pointOfSaleName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transaction.transactionType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Crear nueva transacción
  const handleCreateTransaction = async (data: any) => {
    try {
      const response = await fetch(`${BASE_PATH}/inventory-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al crear transacción');
      
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Recargar inventarios para obtener los datos actualizados después de la transacción
      await loadInventories();
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={transactionStyles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.textSecondary }}>Cargando transacciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={transactionStyles.pageContainer}>
      {/* Header */}
      <div style={transactionStyles.pageHeader}>
        <h1 style={transactionStyles.pageTitle}>
          <FaBox style={{ color: colors.primaryColor }} />
          Transacciones de Inventario
        </h1>
        <p style={transactionStyles.pageSubtitle}>
          Gestiona todas las transacciones de inventario: ventas, reabastecimientos, ajustes y transferencias
        </p>
      </div>

      {/* Barra de herramientas */}
      <div style={transactionStyles.toolbar}>
        {/* Filtros y búsqueda */}
        <div style={transactionStyles.filtersContainer}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
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
              placeholder="Buscar por producto, punto de venta o comentarios..."
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

          {/* Filtro por tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={transactionStyles.filterSelect}
            >
              <option value="all">Todos los tipos</option>
              <option value="sale">Ventas</option>
              <option value="restock">Reabastecimientos</option>
              <option value="adjustment">Ajustes</option>
              <option value="transfer">Transferencias</option>
            </select>
          </div>
        </div>

        {/* Botón crear */}
        <button
          onClick={() => setIsCreating(true)}
          style={transactionStyles.actionButton}
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
          Nueva Transacción
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

      {/* Lista de transacciones */}
      <div>
        {filteredTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            color: colors.textSecondary,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px', opacity: 0.5 }}>
              📋
            </div>
            <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
              {searchQuery || typeFilter !== 'all' 
                ? 'No se encontraron transacciones' 
                : 'No hay transacciones registradas'
              }
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
              {!searchQuery && typeFilter === 'all' && 'Crea tu primera transacción para comenzar'}
            </div>
            {!searchQuery && typeFilter === 'all' && (
              <button
                onClick={() => setIsCreating(true)}
                style={{
                  backgroundColor: colors.primaryColor,
                  color: colors.white,
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Crear Primera Transacción
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              style={transactionStyles.transactionCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = colors.primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = colors.cardBorder;
              }}
            >
              {/* Header de la tarjeta */}
              <div style={transactionStyles.cardHeader}>
                <div style={transactionStyles.transactionType}>
                  <span>{getTransactionIcon(transaction.transactionType)}</span>
                  <span style={getTransactionTypeStyle(transaction.transactionType)}>
                    {getTransactionTypeLabel(transaction.transactionType)}
                  </span>
                </div>
                <div style={transactionStyles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div style={transactionStyles.cardContent}>
                {/* Información del producto */}
                <div style={transactionStyles.productInfo}>
                  <FaBox style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                  <div>
                    <div style={transactionStyles.productName}>
                      {transaction.productName || 'Producto no encontrado'}
                    </div>
                    <div style={transactionStyles.productDetails}>
                      SKU: {transaction.productSku || 'N/A'} • 
                      <FaStore style={{ margin: '0 4px 0 8px', fontSize: '0.8rem' }} />
                      {transaction.pointOfSaleName || 'Punto de venta no encontrado'}
                    </div>
                  </div>
                </div>

                {/* Cantidad */}
                <div style={transactionStyles.quantityInfo}>
                  <span style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                    Cantidad:
                  </span>
                  <span style={getQuantityStyle(transaction.quantity)}>
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                  </span>
                </div>

                {/* Comentarios */}
                {transaction.remarks && (
                  <div style={transactionStyles.remarks}>
                    "{transaction.remarks}"
                  </div>
                )}

                {/* Información de transferencia */}
                {transaction.transactionType === 'transfer' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaStore style={{ color: colors.info }} />
                    <span>
                      {transaction.sourcePointOfSaleName || 'Origen'} 
                      <FaArrowRight style={{ margin: '0 8px', fontSize: '0.8rem' }} />
                      {transaction.destinationPointOfSaleName || 'Destino'}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer de la tarjeta */}
              <div style={transactionStyles.cardFooter}>
                <div style={transactionStyles.pointOfSaleInfo}>
                  ID: {transaction.id}
                </div>
                <div style={transactionStyles.transactionId}>
                  #{transaction.inventoryId}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear transacción */}
      {isCreating && (
        <ModalComponent
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Nueva Transacción de Inventario"
        >
          <TransactionForm
            inventories={inventories}
            onSubmit={handleCreateTransaction}
            onCancel={() => setIsCreating(false)}
          />
        </ModalComponent>
      )}
    </div>
  );
};

export default TransactionsPage;
