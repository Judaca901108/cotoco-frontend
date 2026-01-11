import React, { useState, useEffect } from 'react';
import { FaChartBar, FaStore, FaBox, FaCalendarAlt, FaDollarSign, FaShoppingCart, FaCreditCard, FaMoneyBill, FaQrcode } from 'react-icons/fa';
import { authenticatedFetch } from '../../infrastructure/authService';
import { API_BASE_URL } from '../../config/apiConfig';
import colors from '../../shared/colors';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BASE_PATH = API_BASE_URL;

type SalesByPointOfSale = {
  pointOfSaleId: number;
  pointOfSaleName: string;
  totalQuantity: number;
  totalSales: number;
  transactionCount: number;
};

type TopProduct = {
  productId: number;
  productName: string;
  productSku: string;
  productCategory: string;
  productSubcategory: string;
  productPrice: number;
  totalQuantity: number;
  totalSales: number;
  transactionCount: number;
};

type TransactionSummary = {
  id: number;
  transactionGroupId: string;
  date: string;
  productId: number;
  productName: string;
  productSku: string;
  pointOfSaleId: number;
  pointOfSaleName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'qr';
  userId: number;
  userName: string;
  remarks: string;
};

type SummaryData = {
  totalTransactions: number;
  totalQuantity: number;
  totalSales: number;
  averageTransactionValue: number;
  transactionsByPaymentMethod: {
    cash: number;
    card: number;
    transfer: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
};

type SummaryResponse = {
  summary: SummaryData;
  transactions: TransactionSummary[];
};

const AnalyticsPage: React.FC = () => {
  const [salesByPointOfSale, setSalesByPointOfSale] = useState<SalesByPointOfSale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros de fecha
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Colores para gráficas
  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

  // Obtener rango de fechas
  const getDateRange = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }
    
    if (dateFilter === 'today') {
      return {
        startDate: formatDate(today),
        endDate: formatDate(today)
      };
    }
    
    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return {
        startDate: formatDate(weekAgo),
        endDate: formatDate(today)
      };
    }
    
    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return {
        startDate: formatDate(monthAgo),
        endDate: formatDate(today)
      };
    }
    
    // Por defecto, día actual
    return {
      startDate: formatDate(today),
      endDate: formatDate(today)
    };
  };

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dateRange = getDateRange();
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      // Cargar ventas por punto de venta
      const salesByPOSResponse = await authenticatedFetch(
        `${BASE_PATH}/inventory-transaction/sales/by-point-of-sale?${params.toString()}`
      );
      if (!salesByPOSResponse.ok) throw new Error('Error al cargar ventas por punto de venta');
      const salesByPOSData = await salesByPOSResponse.json();
      setSalesByPointOfSale(salesByPOSData);

      // Cargar productos más vendidos
      params.append('limit', '10');
      const topProductsResponse = await authenticatedFetch(
        `${BASE_PATH}/inventory-transaction/sales/top-products?${params.toString()}`
      );
      if (!topProductsResponse.ok) throw new Error('Error al cargar productos más vendidos');
      const topProductsData = await topProductsResponse.json();
      setTopProducts(topProductsData);

      // Cargar resumen
      params.delete('limit');
      params.append('limit', '20');
      const summaryResponse = await authenticatedFetch(
        `${BASE_PATH}/inventory-transaction/sales/summary?${params.toString()}`
      );
      if (!summaryResponse.ok) throw new Error('Error al cargar resumen');
      const summaryData: SummaryResponse = await summaryResponse.json();
      setSummary(summaryData.summary);
      setTransactions(summaryData.transactions);

    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(err.message || 'Error al cargar datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFilter, customStartDate, customEndDate]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

  // Obtener icono de método de pago
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <FaMoneyBill />;
      case 'card':
        return <FaCreditCard />;
      case 'qr':
        return <FaQrcode />;
      default:
        return <FaDollarSign />;
    }
  };

  // Preparar datos para gráfica de métodos de pago
  const paymentMethodData = summary ? [
    { name: 'Efectivo', value: summary.transactionsByPaymentMethod.cash, icon: 'cash' },
    { name: 'Tarjeta', value: summary.transactionsByPaymentMethod.card, icon: 'card' },
    { name: 'QR', value: summary.transactionsByPaymentMethod.transfer, icon: 'qr' },
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: colors.textSecondary }}>Cargando datos de analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
    }} className="page-container-responsive">
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
          <FaChartBar style={{ color: colors.primaryColor }} />
          Analytics de Ventas
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          margin: 0,
        }}>
          Análisis detallado de ventas, productos y puntos de venta
        </p>
      </div>

      {/* Filtros de fecha */}
      <div style={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCalendarAlt style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '0.95rem',
              backgroundColor: colors.backgroundTertiary,
              border: `1px solid ${colors.borderColor}`,
              borderRadius: '8px',
              color: colors.textPrimary,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Último mes</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>

        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                padding: '10px 16px',
                fontSize: '0.95rem',
                backgroundColor: colors.backgroundTertiary,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '8px',
                color: colors.textPrimary,
                outline: 'none',
              }}
            />
            <span style={{ color: colors.textSecondary }}>a</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                padding: '10px 16px',
                fontSize: '0.95rem',
                backgroundColor: colors.backgroundTertiary,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '8px',
                color: colors.textPrimary,
                outline: 'none',
              }}
            />
          </div>
        )}

        {summary && (
          <div style={{ 
            marginLeft: 'auto',
            fontSize: '0.9rem',
            color: colors.textSecondary,
          }}>
            Período: {summary.dateRange.startDate} a {summary.dateRange.endDate}
          </div>
        )}
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

      {/* Resumen general */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: colors.textSecondary, 
              marginBottom: '8px' 
            }}>
              Total de Transacciones
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: colors.primaryColor 
            }}>
              {summary.totalTransactions}
            </div>
          </div>

          <div style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: colors.textSecondary, 
              marginBottom: '8px' 
            }}>
              Total Vendido
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: colors.success 
            }}>
              {formatCurrency(summary.totalSales)}
            </div>
          </div>

          <div style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: colors.textSecondary, 
              marginBottom: '8px' 
            }}>
              Cantidad Total
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: colors.info 
            }}>
              {summary.totalQuantity}
            </div>
          </div>

          <div style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: colors.textSecondary, 
              marginBottom: '8px' 
            }}>
              Ticket Promedio
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: colors.warning 
            }}>
              {formatCurrency(summary.averageTransactionValue)}
            </div>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '30px',
        marginBottom: '30px',
      }}>
        {/* Ventas por punto de venta */}
        <div style={{
          backgroundColor: colors.cardBackground,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <FaStore style={{ color: colors.primaryColor }} />
            Ventas por Punto de Venta
          </h2>
          {salesByPointOfSale.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByPointOfSale}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} />
                <XAxis 
                  dataKey="pointOfSaleName" 
                  stroke={colors.textSecondary}
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={colors.textSecondary}
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number | undefined) => value ? formatCurrency(value) : ''}
                  contentStyle={{
                    backgroundColor: colors.cardBackground,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="totalSales" fill={colors.primaryColor} name="Ventas Totales" />
                <Bar dataKey="totalQuantity" fill={colors.success} name="Cantidad Total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: colors.textSecondary 
            }}>
              No hay datos de ventas para mostrar
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        {summary && paymentMethodData.length > 0 && (
          <div style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <FaCreditCard style={{ color: colors.primaryColor }} />
              Métodos de Pago
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Productos más vendidos */}
      <div style={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
      }}>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FaBox style={{ color: colors.primaryColor }} />
          Productos Más Vendidos
        </h2>
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} />
              <XAxis 
                type="number"
                stroke={colors.textSecondary}
                fontSize={12}
                tickFormatter={(value) => value.toString()}
              />
              <YAxis 
                type="category"
                dataKey="productName"
                stroke={colors.textSecondary}
                fontSize={12}
                width={150}
              />
              <Tooltip 
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (!value) return '';
                  if (name === 'totalSales') return formatCurrency(value);
                  return value.toString();
                }}
                contentStyle={{
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="totalQuantity" fill={colors.primaryColor} name="Cantidad Vendida" />
              <Bar dataKey="totalSales" fill={colors.success} name="Ventas Totales" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: colors.textSecondary 
          }}>
            No hay productos vendidos para mostrar
          </div>
        )}
      </div>

      {/* Últimas transacciones */}
      <div style={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FaShoppingCart style={{ color: colors.primaryColor }} />
          Últimas Transacciones de Ventas
        </h2>
        {transactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  borderBottom: `2px solid ${colors.borderColor}`,
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Fecha</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Producto</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Punto de Venta</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Cantidad</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Total</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Pago</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id}
                    style={{
                      borderBottom: `1px solid ${colors.borderColor}`,
                      backgroundColor: index % 2 === 0 ? 'transparent' : colors.backgroundTertiary,
                    }}
                  >
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: colors.textPrimary }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: colors.textPrimary }}>
                      <div style={{ fontWeight: '600' }}>{transaction.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                        {transaction.productSku}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: colors.textPrimary }}>
                      {transaction.pointOfSaleName}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center',
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      color: colors.primaryColor 
                    }}>
                      {transaction.quantity}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      color: colors.success 
                    }}>
                      {formatCurrency(transaction.total)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center',
                      fontSize: '0.9rem', 
                      color: colors.textSecondary 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span style={{ textTransform: 'capitalize' }}>
                          {transaction.paymentMethod === 'qr' ? 'QR' : transaction.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: colors.textPrimary }}>
                      {transaction.userName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: colors.textSecondary 
          }}>
            No hay transacciones para mostrar
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
