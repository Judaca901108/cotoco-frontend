import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaBox, FaStore, FaArrowRight, FaUser, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import TransactionForm from '../components/TransactionForm';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
import { getTransactionStyles, getTransactionTypeStyle, getQuantityStyle, getTransactionIcon, getTransactionTypeLabel } from '../../shared/transactionStyles';
import { useTheme } from '../../application/contexts/ThemeContext';

import { API_BASE_URL } from '../../config/apiConfig';
const BASE_PATH = API_BASE_URL;

type TransactionItem = {
  id: number;
  inventoryId: number;
  quantity: number;
  discount?: number;
  inventory?: {
    id: number;
    productId: number;
    pointOfSaleId: number;
    stockQuantity: number;
    minimumStock: number;
    onDisplay: number;
  };
};

type Transaction = {
  id: number;
  inventoryId?: number | null;
  transactionType: 'sale' | 'restock' | 'adjustment' | 'transfer';
  quantity?: number;
  remarks: string;
  createdAt: string;
  date?: string;
  sourcePointOfSaleId?: number | null;
  destinationPointOfSaleId?: number | null;
  transactionGroupId?: string | null;
  isGrouped?: boolean;
  items?: TransactionItem[];
  totalQuantity?: number;
  itemsCount?: number;
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
  // Datos enriquecidos de items
  enrichedItems?: Array<{
    inventoryId: number;
    quantity: number;
    productName: string;
    productSku: string;
    barcode?: string;
    pointOfSaleName: string;
    price?: number;
    subtotal?: number;
    discount?: number;
  }>;
  totalValue?: number;
  discount?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'mixed';
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
  const { theme } = useTheme();
  const transactionStyles = getTransactionStyles(theme);
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

  // Función para enriquecer transacciones
  const enrichTransactions = async (transactionsData: any[]) => {
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

    const enrichedTransactions = transactionsData.map((transaction: any) => {
          // Para transferencias, buscar puntos de venta origen y destino
          const sourcePointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.sourcePointOfSaleId);
          const destinationPointOfSale = pointsOfSaleData.find((pos: any) => pos.id === transaction.destinationPointOfSaleId);

          // Buscar el usuario que realizó la transacción
          const user = usersData.find((u: any) => u.id === transaction.userId);

          // Si es una transacción agrupada, enriquecer los items
          let enrichedItems: any[] = [];
          let totalValue = 0;
          
          if (transaction.isGrouped && transaction.items && Array.isArray(transaction.items)) {
            enrichedItems = transaction.items.map((item: any) => {
              const inventory = item.inventory || inventoriesData.find((inv: any) => inv.id === item.inventoryId);
              const product = inventory ? productsData.find((p: any) => p.id === inventory.productId) : null;
              const pointOfSale = inventory ? pointsOfSaleData.find((pos: any) => pos.id === inventory.pointOfSaleId) : null;
              
              const price = product?.price || 0;
              const subtotal = price * item.quantity;
              
              // Solo calcular total para ventas
              if (transaction.transactionType === 'sale') {
                totalValue += subtotal;
              }
              
              return {
                inventoryId: item.inventoryId,
                quantity: item.quantity,
                productName: product?.name || `Producto ${inventory?.productId || 'N/A'}`,
                productSku: product?.sku || 'N/A',
                barcode: product?.barcode,
                pointOfSaleName: pointOfSale?.name || `Punto de Venta ${inventory?.pointOfSaleId || 'N/A'}`,
                price: price,
                subtotal: subtotal,
                discount: item.discount || 0,
              };
            });
          }

          // Para transacciones individuales, enriquecer como antes
          let productName = '';
          let productSku = 'N/A';
          let pointOfSaleName = '';
          
          if (!transaction.isGrouped && transaction.inventoryId) {
            const inventory = transaction.inventory || inventoriesData.find((inv: any) => inv.id === transaction.inventoryId);
            const product = inventory ? productsData.find((p: any) => p.id === inventory.productId) : null;
            const pointOfSale = inventory ? pointsOfSaleData.find((pos: any) => pos.id === inventory.pointOfSaleId) : null;
            
            productName = product?.name || `Producto ${inventory?.productId || transaction.productId || 'N/A'}`;
            productSku = product?.sku || 'N/A';
            pointOfSaleName = pointOfSale?.name || `Punto de Venta ${inventory?.pointOfSaleId || transaction.pointOfSaleId || 'N/A'}`;
          }

          return {
            ...transaction,
            productName,
            productSku,
            pointOfSaleName,
            sourcePointOfSaleName: sourcePointOfSale?.name || `Punto de Venta ${transaction.sourcePointOfSaleId || 'N/A'}`,
            destinationPointOfSaleName: destinationPointOfSale?.name || `Punto de Venta ${transaction.destinationPointOfSaleId || 'N/A'}`,
            // Información del usuario
            userName: user?.name || transaction.user?.name || 'Usuario no encontrado',
            userUsername: user?.username || transaction.user?.username || 'N/A',
            // Items enriquecidos para transacciones agrupadas
            enrichedItems: enrichedItems.length > 0 ? enrichedItems : undefined,
            // Valor total (solo para ventas)
            totalValue: transaction.transactionType === 'sale' ? totalValue : undefined,
            // Descuento (solo para ventas)
            discount: transaction.discount || 0,
            paymentMethod: transaction.paymentMethod,
            // Asegurar que remarks siempre tenga un valor
            remarks: transaction.remarks || '',
            // Usar date si está disponible, sino createdAt
            createdAt: transaction.date || transaction.createdAt,
          };
        });

    return enrichedTransactions;
  };

  // Cargar transacciones
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

      // Enriquecer transacciones
      const enrichedTransactions = await enrichTransactions(data);
        setTransactions(enrichedTransactions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  // Cargar transacciones cuando cambian los filtros
  useEffect(() => {
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
    const searchLower = searchQuery.toLowerCase();
    
    // Buscar en remarks
    const matchesRemarks = (transaction.remarks || '').toLowerCase().includes(searchLower);
    
    // Buscar en producto principal (transacciones individuales)
    const matchesProduct = transaction.productName?.toLowerCase().includes(searchLower) ||
                          transaction.productSku?.toLowerCase().includes(searchLower);
    
    // Buscar en punto de venta
    const matchesPointOfSale = transaction.pointOfSaleName?.toLowerCase().includes(searchLower);
    
    // Buscar en items de transacciones agrupadas
    const matchesItems = transaction.enrichedItems?.some((item: any) =>
      item.productName?.toLowerCase().includes(searchLower) ||
      item.productSku?.toLowerCase().includes(searchLower) ||
      item.barcode?.toLowerCase().includes(searchLower) ||
      item.pointOfSaleName?.toLowerCase().includes(searchLower)
    ) || false;
    
    const matchesSearch = matchesRemarks || matchesProduct || matchesPointOfSale || matchesItems;
    const matchesType = typeFilter === 'all' || transaction.transactionType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Crear nueva transacción
  const handleCreateTransaction = async (data: any) => {
    try {
      console.log('📤 Enviando transacción bulk:', data);
      const response = await authenticatedFetch(`${BASE_PATH}/inventory-transaction/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', response.status, errorText);
        throw new Error(`Error al crear transacción: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Transacción creada exitosamente');
      
      // Recargar todas las transacciones para obtener la información completa
      await loadTransactions();
      
      // Recargar inventarios para obtener los datos actualizados después de la transacción
      await loadInventories();
      
      setIsCreating(false);
      setError(''); // Limpiar cualquier error previo
    } catch (err: any) {
      console.error('❌ Error completo al crear transacción:', err);
      setError(err.message || 'Error al crear la transacción. Verifica que el backend esté corriendo y accesible.');
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

  // Función para exportar transacciones a CSV
  const handleExportToCSV = () => {
    // Headers del CSV
    const csvHeaders = [
      'ID Transacción',
      'Tipo',
      'Fecha',
      'Usuario',
      'Producto',
      'SKU',
      'Código de Barras',
      'Punto de Venta',
      'Origen',
      'Destino',
      'Cantidad',
      'Precio Unitario',
      'Subtotal',
      'Valor Total',
      'Comentarios'
    ];

    // Convertir transacciones a filas CSV
    const csvRows: string[] = [];

    filteredTransactions.forEach(transaction => {
      const tipo = getTransactionTypeLabel(transaction.transactionType);
      const fecha = formatDate(transaction.date || transaction.createdAt);
      const usuario = transaction.userName || 'N/A';
      const comentarios = `"${(transaction.remarks || '').replace(/"/g, '""')}"`;
      const origen = transaction.sourcePointOfSaleName || '';
      const destino = transaction.destinationPointOfSaleName || '';
      const valorTotal = transaction.transactionType === 'sale' && transaction.totalValue 
        ? transaction.totalValue.toString() 
        : '';

      // Si es transacción agrupada, crear una fila por cada item
      if (transaction.isGrouped && transaction.enrichedItems && transaction.enrichedItems.length > 0) {
        transaction.enrichedItems.forEach((item, index) => {
          const precioUnitario = item.price ? item.price.toString() : '';
          const subtotal = item.subtotal ? item.subtotal.toString() : '';
          
          // Solo mostrar valor total en la primera fila de la transacción agrupada
          const mostrarValorTotal = index === 0 ? valorTotal : '';

          csvRows.push([
            transaction.id.toString(),
            `"${tipo}"`,
            `"${fecha}"`,
            `"${usuario}"`,
            `"${item.productName}"`,
            `"${item.productSku}"`,
            item.barcode ? `"${item.barcode}"` : '',
            `"${item.pointOfSaleName}"`,
            `"${origen}"`,
            `"${destino}"`,
            item.quantity.toString(),
            precioUnitario,
            subtotal,
            mostrarValorTotal,
            index === 0 ? comentarios : '' // Solo comentarios en la primera fila
          ].join(','));
        });
      } else {
        // Transacción individual
        const producto = transaction.productName || 'N/A';
        const sku = transaction.productSku || 'N/A';
        const puntoVenta = transaction.pointOfSaleName || '';
        const cantidad = (transaction.quantity || 0).toString();

        csvRows.push([
          transaction.id.toString(),
          `"${tipo}"`,
          `"${fecha}"`,
          `"${usuario}"`,
          `"${producto}"`,
          `"${sku}"`,
          '',
          `"${puntoVenta}"`,
          `"${origen}"`,
          `"${destino}"`,
          cantidad,
          '',
          '',
          valorTotal,
          comentarios
        ].join(','));
      }
    });

    // Combinar headers y filas
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows
    ].join('\n');

    // Crear BOM para UTF-8 (para Excel)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Nombre del archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const fileName = `transacciones_${date}.csv`;
    link.setAttribute('download', fileName);
    
    // Trigger descarga
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={transactionStyles.pageContainer} className="page-container-responsive">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: theme.textSecondary }}>Cargando transacciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={transactionStyles.pageContainer} className="page-container-responsive">
      {/* Header */}
      <div style={transactionStyles.pageHeader}>
        <h1 style={transactionStyles.pageTitle}>
          <FaBox style={{ color: theme.primaryColor }} />
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
      <div style={transactionStyles.toolbar} className="toolbar-responsive">
        {/* Filtros y búsqueda */}
        <div style={transactionStyles.filtersContainer} className="filters-container-responsive">
          {/* Búsqueda */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textSecondary,
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
                backgroundColor: theme.backgroundTertiary,
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '8px',
                color: theme.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.primaryColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.borderColor;
              }}
            />
          </div>

          {/* Filtro por tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter style={{ color: theme.textSecondary, fontSize: '0.9rem' }} />
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
            <FaCalendarAlt style={{ color: theme.textSecondary, fontSize: '0.9rem' }} />
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
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>a</span>
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

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Botón exportar CSV */}
          <button
            onClick={handleExportToCSV}
            disabled={filteredTransactions.length === 0}
            style={{
              ...transactionStyles.actionButton,
              backgroundColor: filteredTransactions.length === 0 ? theme.buttonSecondary : '#10b981',
              color: filteredTransactions.length === 0 ? theme.textSecondary : theme.white,
              cursor: filteredTransactions.length === 0 ? 'not-allowed' : 'pointer',
              opacity: filteredTransactions.length === 0 ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (filteredTransactions.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (filteredTransactions.length > 0) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
          >
            <FaDownload />
            Exportar CSV
          </button>

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
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${theme.error}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: theme.error,
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
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '12px',
            color: theme.textSecondary,
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
                  backgroundColor: theme.primaryColor,
                  color: theme.white,
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
              className="transaction-card-grid-responsive"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = theme.primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = theme.cardBorder;
              }}
            >
              {/* Header compacto: Tipo y Fecha */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${theme.borderColor}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getTransactionIcon(transaction.transactionType)}</span>
                  <span style={getTransactionTypeStyle(transaction.transactionType, theme)}>
                    {getTransactionTypeLabel(transaction.transactionType)}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: theme.textSecondary }}>
                  {formatDate(transaction.date || transaction.createdAt)}
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: theme.textSecondary, 
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Productos
                </div>
                {transaction.isGrouped && transaction.enrichedItems && transaction.enrichedItems.length > 0 ? (
                  transaction.enrichedItems.map((item, index) => (
                    <div
                      key={item.inventoryId}
                      style={{
                        padding: '8px',
                        marginBottom: index < transaction.enrichedItems!.length - 1 ? '6px' : '0',
                        backgroundColor: theme.backgroundTertiary,
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: theme.textPrimary }}>
                          {item.productName}
                        </span>
                        <span style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                          ${(item.price || 0).toLocaleString('es-CO')} × {item.quantity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                        <FaStore style={{ marginRight: '4px', fontSize: '0.7rem' }} />
                        {item.pointOfSaleName}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '8px',
                    backgroundColor: theme.backgroundTertiary,
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: theme.textPrimary }}>
                        {transaction.productName || 'Producto no encontrado'}
                      </span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                        Cantidad: {transaction.quantity || 0}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                      <FaStore style={{ marginRight: '4px', fontSize: '0.7rem' }} />
                      {transaction.pointOfSaleName || 'Punto de venta no encontrado'}
                    </div>
                  </div>
                )}
              </div>

              {/* Totales y valores (solo para ventas) */}
              {transaction.transactionType === 'sale' && transaction.totalValue !== undefined && (
                <div style={{
                  marginBottom: '12px',
                  padding: '10px',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: theme.textSecondary }}>Subtotal:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>
                      ${transaction.totalValue.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: theme.textSecondary }}>Descuento:</span>
                    <span style={{ color: '#60A5FA', fontWeight: '600' }}>
                      -${(transaction.discount || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '4px',
                    borderTop: `1px solid ${theme.borderColor}`,
                    marginTop: '4px',
                  }}>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>Total:</span>
                    <span style={{ color: theme.success, fontWeight: '700', fontSize: '0.95rem' }}>
                      ${(transaction.totalValue - (transaction.discount || 0)).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}

              {/* Total de cantidad (para otros tipos) */}
              {transaction.transactionType !== 'sale' && (
                <div style={{
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: theme.textSecondary }}>Total:</span>
                  <span style={getQuantityStyle(transaction.totalQuantity || transaction.quantity || 0, transaction.transactionType, theme)}>
                    {transaction.totalQuantity || transaction.quantity || 0}
                  </span>
                </div>
              )}

              {/* Transferencia */}
              {transaction.transactionType === 'transfer' && (
                <div style={{
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: theme.textSecondary,
                }}>
                  <FaStore style={{ marginRight: '4px', fontSize: '0.75rem' }} />
                  {transaction.sourcePointOfSaleName || 'Origen'} 
                  <FaArrowRight style={{ margin: '0 6px', fontSize: '0.7rem' }} />
                  {transaction.destinationPointOfSaleName || 'Destino'}
                </div>
              )}

              {/* Observación */}
              {transaction.remarks && (
                <div style={{
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: theme.textSecondary,
                  fontStyle: 'italic',
                }}>
                  {transaction.remarks}
                </div>
              )}

              {/* Footer compacto: Usuario ID */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: `1px solid ${theme.borderColor}`,
                fontSize: '0.8rem',
                color: theme.textSecondary,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUser style={{ fontSize: '0.75rem' }} />
                  <span>{transaction.userName || 'Usuario no encontrado'}</span>
                </div>
                <div>
                  ID: {transaction.userId || 'N/A'}
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
