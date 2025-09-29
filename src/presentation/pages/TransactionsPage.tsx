import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaBox, FaStore, FaArrowRight, FaUser, FaCalendarAlt } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import TransactionForm from '../components/TransactionForm';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
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
  // Información del usuario
  userId?: number;
  userName?: string;
  userUsername?: string;
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
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin } = useAuth();

  // Función para generar fechas de filtro
  const getDateRange = (filter: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (filter) {
      case '3months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return {
          startDate: formatDate(threeMonthsAgo),
          endDate: formatDate(today)
        };
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return {
          startDate: formatDate(sixMonthsAgo),
          endDate: formatDate(today)
        };
      case 'custom':
        return {
          startDate: customStartDate,
          endDate: customEndDate
        };
      default:
        return null;
    }
  };

  // Cargar transacciones
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Construir endpoint base
        let endpoint = isAdmin 
          ? `${BASE_PATH}/inventory-transaction`  // Admin ve todas las transacciones
          : `${BASE_PATH}/inventory-transaction?userId=${user?.id}`;  // Usuario ve solo sus transacciones
        
        // Agregar filtros de fecha si están seleccionados
        const dateRange = getDateRange(dateFilter);
        if (dateRange && dateRange.startDate && dateRange.endDate) {
          const separator = endpoint.includes('?') ? '&' : '?';
          endpoint += `${separator}startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        
        const response = await authenticatedFetch(endpoint);
        if (!response.ok) throw new Error('Error al cargar transacciones');
        const data = await response.json();

        // Enriquecer transacciones con nombres de productos, puntos de venta y usuarios
        const [productsResponse, pointsOfSaleResponse, inventoriesResponse, usersResponse] = await Promise.all([
          authenticatedFetch(`${BASE_PATH}/product`),
          authenticatedFetch(`${BASE_PATH}/point-of-sale`),
          authenticatedFetch(`${BASE_PATH}/inventory`),
          authenticatedFetch(`${BASE_PATH}/users`)
        ]);

        const productsData = await productsResponse.json();
        const pointsOfSaleData = await pointsOfSaleResponse.json();
        const inventoriesData = await inventoriesResponse.json();
        const usersData = await usersResponse.json();

        const enrichedTransactions = data.map((transaction: any) => {
          // Buscar el inventario relacionado con la transacción
          const inventory = inventoriesData.find((inv: any) => inv.id === transaction.inventoryId);
          
          // Buscar el producto usando el productId del inventario
          const product = inventory ? productsData.find((p: any) => p.id === inventory.productId) : null;
          
          // Buscar el punto de venta usando el pointOfSaleId del inventario
          const pointOfSale = inventory ? pointsOfSaleData.find((pos: any) => pos.id === inventory.pointOfSaleId) : null;
          
          // Para transferencias, buscar puntos de venta origen y destino
          const sourcePointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.sourcePointOfSaleId);
          const destinationPointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.destinationPointOfSaleId);

          // Buscar el usuario que realizó la transacción
          const user = usersData.find((u: any) => u.id === transaction.userId);

          return {
            ...transaction,
            productId: inventory?.productId || transaction.productId,
            pointOfSaleId: inventory?.pointOfSaleId || transaction.pointOfSaleId,
            productName: product?.name || `Producto ${inventory?.productId || transaction.productId || 'N/A'}`,
            productSku: product?.sku || 'N/A',
            pointOfSaleName: pointOfSale?.name || `Punto de Venta ${inventory?.pointOfSaleId || transaction.pointOfSaleId || 'N/A'}`,
            sourcePointOfSaleName: sourcePointOfSale?.name || `Punto de Venta ${transaction.sourcePointOfSaleId || 'N/A'}`,
            destinationPointOfSaleName: destinationPointOfSale?.name || `Punto de Venta ${transaction.destinationPointOfSaleId || 'N/A'}`,
            // Información del usuario
            userName: user?.name || 'Usuario no encontrado',
            userUsername: user?.username || 'N/A',
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
  }, [isAdmin, user?.id, dateFilter, customStartDate, customEndDate]);

  // Función para cargar inventarios
  const loadInventories = async () => {
    try {
      // Cargar inventarios y productos en paralelo
      const [inventoriesResponse, productsResponse] = await Promise.all([
        authenticatedFetch(`${BASE_PATH}/inventory`),
        authenticatedFetch(`${BASE_PATH}/product`)
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
      const response = await authenticatedFetch(`${BASE_PATH}/inventory-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al crear transacción');
      
      const newTransaction = await response.json();
      
      // Enriquecer la nueva transacción con nombres de productos, puntos de venta y usuarios
      const [productsResponse, pointsOfSaleResponse, inventoriesResponse, usersResponse] = await Promise.all([
        authenticatedFetch(`${BASE_PATH}/product`),
        authenticatedFetch(`${BASE_PATH}/point-of-sale`),
        authenticatedFetch(`${BASE_PATH}/inventory`),
        authenticatedFetch(`${BASE_PATH}/users`)
      ]);

      const productsData = await productsResponse.json();
      const pointsOfSaleData = await pointsOfSaleResponse.json();
      const inventoriesData = await inventoriesResponse.json();
      const usersData = await usersResponse.json();

      // Buscar el inventario relacionado con la nueva transacción
      const inventory = inventoriesData.find((inv: any) => inv.id === newTransaction.inventoryId);
      
      // Buscar el producto usando el productId del inventario
      const product = inventory ? productsData.find((p: any) => p.id === inventory.productId) : null;
      
      // Buscar el punto de venta usando el pointOfSaleId del inventario
      const pointOfSale = inventory ? pointsOfSaleData.find((pos: any) => pos.id === inventory.pointOfSaleId) : null;
      
      // Para transferencias, buscar puntos de venta origen y destino
      const sourcePointOfSale = pointsOfSaleData.find((pos: any) => pos.id === newTransaction.sourcePointOfSaleId);
      const destinationPointOfSale = pointsOfSaleData.find((pos: any) => pos.id === newTransaction.destinationPointOfSaleId);

      // Buscar el usuario que realizó la transacción
      const user = usersData.find((u: any) => u.id === newTransaction.userId);

      const enrichedNewTransaction = {
        ...newTransaction,
        productId: inventory?.productId || newTransaction.productId,
        pointOfSaleId: inventory?.pointOfSaleId || newTransaction.pointOfSaleId,
        productName: product?.name || `Producto ${inventory?.productId || newTransaction.productId || 'N/A'}`,
        productSku: product?.sku || 'N/A',
        pointOfSaleName: pointOfSale?.name || `Punto de Venta ${inventory?.pointOfSaleId || newTransaction.pointOfSaleId || 'N/A'}`,
        sourcePointOfSaleName: sourcePointOfSale?.name || `Punto de Venta ${newTransaction.sourcePointOfSaleId || 'N/A'}`,
        destinationPointOfSaleName: destinationPointOfSale?.name || `Punto de Venta ${newTransaction.destinationPointOfSaleId || 'N/A'}`,
        // Información del usuario
        userName: user?.name || 'Usuario no encontrado',
        userUsername: user?.username || 'N/A',
      };

      setTransactions(prev => [enrichedNewTransaction, ...prev]);
      
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
          {isAdmin ? 'Transacciones de Inventario' : 'Mis Transacciones'}
        </h1>
        <p style={transactionStyles.pageSubtitle}>
          {isAdmin 
            ? 'Gestiona todas las transacciones de inventario: ventas, reabastecimientos, ajustes y transferencias'
            : 'Gestiona tus transacciones de inventario: ventas, reabastecimientos, ajustes y transferencias'
          }
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

          {/* Filtro por fecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarAlt style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={transactionStyles.filterSelect}
            >
              <option value="all">Todas las fechas</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="custom">Rango personalizado</option>
            </select>
          </div>

          {/* Filtros de fecha personalizada */}
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  ...transactionStyles.filterSelect,
                  minWidth: '140px',
                }}
                placeholder="Fecha inicio"
              />
              <span style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>a</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  ...transactionStyles.filterSelect,
                  minWidth: '140px',
                }}
                placeholder="Fecha fin"
              />
            </div>
          )}
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
                  <span style={getQuantityStyle(transaction.quantity, transaction.transactionType)}>
                    {transaction.quantity}
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
                  <FaUser style={{ marginRight: '6px', fontSize: '0.8rem', color: colors.textSecondary }} />
                  {transaction.userName || 'Usuario no encontrado'}
                  {transaction.userUsername && (
                    <span style={{ color: colors.textMuted, marginLeft: '8px' }}>
                      (@{transaction.userUsername})
                    </span>
                  )}
                </div>
                <div style={transactionStyles.transactionId}>
                  ID: {transaction.id} • #{transaction.inventoryId}
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
