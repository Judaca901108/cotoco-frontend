import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaTimes, FaBox, FaStore, FaExchangeAlt, FaInfoCircle, FaSearch, FaPlus, FaTrash, FaEdit, FaCreditCard, FaMoneyBill, FaQrcode, FaDollarSign } from 'react-icons/fa';
import { getFormStyles, getInputStyles, getSelectStyles, getTextareaStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
import { useTheme } from '../../application/contexts/ThemeContext';
import { API_BASE_URL } from '../../config/apiConfig';

type Inventory = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  pointOfSaleId: number;
  pointOfSaleName: string;
  stockQuantity: number;
};

type SearchInventoryResult = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  barcode?: string;
  stockQuantity: number;
  minimumStock: number;
  onDisplay: number;
  price?: number;
};

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

type TransactionItem = {
  inventoryId: number;
  productId?: number; // Para reabastecimiento de productos nuevos
  quantity: number;
  productName: string;
  productSku: string;
  barcode?: string;
  stockQuantity: number;
  price?: number;
};

type TransactionFormProps = {
  inventories: Inventory[];
  onSubmit: (data: {
    transactionType: 'sale' | 'restock' | 'adjustment' | 'transfer';
    remarks: string;
    items: Array<{
      inventoryId?: number;
      productId?: number;
      quantity: number;
    }>;
    sourcePointOfSaleId?: number;
    destinationPointOfSaleId?: number;
  }) => void;
  onCancel: () => void;
  title?: string;
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  inventories,
  onSubmit,
  onCancel,
  title = "Nueva Transacción"
}) => {
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const formStyles = getFormStyles(theme);
  const [formData, setFormData] = useState({
    pointOfSaleId: 0,
    transactionType: 'sale' as 'sale' | 'restock' | 'adjustment' | 'transfer',
    paymentMethod: '' as 'card' | 'qr' | 'cash' | '',
    remarks: '',
    destinationPointOfSaleId: 0,
    discount: '0',
  });

  // Estado para la lista de items de la transacción
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [itemQuantity, setItemQuantity] = useState<string>('1');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  
  // Estados para búsqueda de productos
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchInventoryResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchInventoryResult | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar puntos de venta
  useEffect(() => {
    const loadPointsOfSale = async () => {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/point-of-sale`);
        if (response.ok) {
          const data = await response.json();
          setPointsOfSale(data);
        }
      } catch (error) {
        console.error('Error loading points of sale:', error);
      }
    };

    loadPointsOfSale();
  }, []);

  // Función para buscar productos en el inventario del punto de venta o productos generales
  const searchProducts = async (pointOfSaleId: number, query: string, transactionType: string) => {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      let response;
      
      // Para reabastecimiento, usar el endpoint general de productos
      if (transactionType === 'restock') {
        response = await authenticatedFetch(
          `${API_BASE_URL}/product/search?q=${encodeURIComponent(trimmedQuery)}`
        );
      } else {
        // Para otros tipos, usar el endpoint de inventario del punto de venta
        response = await authenticatedFetch(
          `${API_BASE_URL}/point-of-sale/${pointOfSaleId}/inventory/search?q=${encodeURIComponent(trimmedQuery)}`
        );
      }
      
      if (response.ok) {
        const data = await response.json();
        // Formatear los datos según el tipo de endpoint usado
        const formattedData = (Array.isArray(data) ? data : []).map((item: any) => {
          // Si es reabastecimiento, los datos vienen del endpoint de productos
          if (transactionType === 'restock') {
            return {
              id: item.id,
              productId: item.id, // El id del producto es el mismo que el id del resultado
              productName: item.name || 'Producto sin nombre',
              productSku: item.sku || 'N/A',
              barcode: item.barcode || undefined,
              stockQuantity: 0, // No hay stock en el endpoint de productos
              minimumStock: 0,
              onDisplay: 0,
              price: item.price || undefined,
            };
          } else {
            // Para otros tipos, los datos vienen del endpoint de inventario
            return {
              id: item.id,
              productId: item.productId || item.product?.id,
              productName: item.productName || item.product?.name || 'Producto sin nombre',
              productSku: item.productSku || item.product?.sku || 'N/A',
              barcode: item.barcode || item.product?.barcode || undefined,
              stockQuantity: item.stockQuantity || item.stock || 0,
              minimumStock: item.minimumStock || 0,
              onDisplay: item.onDisplay || 0,
              price: item.product?.price || item.price || undefined,
            };
          }
        });
        setSearchResults(formattedData);
        setShowDropdown(true);
      } else {
        console.error('Error en respuesta de búsqueda:', response.status, response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Efecto para manejar el debounce de búsqueda (0.5 segundos)
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Verificación de seguridad para productSearchQuery
    const query = productSearchQuery || '';
    const trimmedQuery = query.trim();

    // Si hay un tipo de transacción, punto de venta seleccionado (excepto para restock) y hay texto de búsqueda (mínimo 2 caracteres)
    // Y no hay un producto seleccionado (para evitar buscar cuando se selecciona)
    const canSearch = formData.transactionType && 
      (formData.transactionType === 'restock' || formData.pointOfSaleId) && 
      trimmedQuery.length >= 2 && 
      !selectedProduct;
    
    if (canSearch) {
      // Esperar 0.5 segundos antes de buscar
      searchTimeoutRef.current = setTimeout(() => {
        // Para restock no necesitamos pointOfSaleId, pero lo pasamos para mantener la firma
        const pointOfSaleId = formData.transactionType === 'restock' ? 0 : formData.pointOfSaleId;
        searchProducts(pointOfSaleId, trimmedQuery, formData.transactionType);
      }, 500);
    } else if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [productSearchQuery, formData.pointOfSaleId, selectedProduct]);

  // Limpiar búsqueda cuando cambia el punto de venta o el tipo de transacción
  useEffect(() => {
    // Limpiar timeout si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setProductSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setShowDropdown(false);
    setIsSearching(false);
  }, [formData.pointOfSaleId, formData.transactionType]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tipos de transacciones disponibles según el rol del usuario
  const getAllTransactionTypes = () => [
    { value: 'sale', label: 'Venta', description: 'Reduce el inventario por venta de productos' },
    { value: 'restock', label: 'Reabastecimiento', description: 'Aumenta el inventario por compra o reposición' },
    { value: 'adjustment', label: 'Ajuste', description: 'Corrección de inventario (productos dañados, pérdidas, etc.). Permite cantidades negativas para reducir stock.' },
    { value: 'transfer', label: 'Transferencia', description: 'Movimiento de productos entre puntos de venta' },
  ];

  // Filtrar tipos de transacciones según el rol
  const transactionTypes = isAdmin 
    ? getAllTransactionTypes()  // Admin puede crear todos los tipos
    : getAllTransactionTypes().filter(type => 
        type.value === 'sale' || type.value === 'adjustment'  // Usuario solo puede crear ventas y ajustes
      );

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.pointOfSaleId) {
      newErrors.pointOfSaleId = 'Debe seleccionar un punto de venta.';
    }
    
    if (!formData.transactionType) {
      newErrors.transactionType = 'Debe seleccionar un tipo de transacción.';
    }
    
    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Los comentarios son obligatorios.';
    }
    
    // Validaciones específicas por tipo
    if (formData.transactionType === 'sale') {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Debe seleccionar un método de pago.';
      }
      // Validar descuento
      const discountValue = parseFloat(formData.discount) || 0;
      if (discountValue < 0) {
        newErrors.discount = 'El descuento no puede ser negativo.';
      } else if (transactionItems.length > 0) {
        const totalAmount = transactionItems.reduce((total, item) => {
          const itemPrice = item.price || 0;
          const itemQuantity = item.quantity || 0;
          return total + (itemPrice * itemQuantity);
        }, 0);
        if (discountValue > totalAmount) {
          newErrors.discount = `El descuento no puede superar el monto total (${totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}).`;
        }
      }
    }
    
    if (formData.transactionType === 'transfer') {
      if (!formData.destinationPointOfSaleId) {
        newErrors.destinationPointOfSaleId = 'Debe seleccionar el punto de venta destino.';
      }
      if (formData.pointOfSaleId === formData.destinationPointOfSaleId) {
        newErrors.destinationPointOfSaleId = 'El destino debe ser diferente al origen.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'quantity' || name === 'pointOfSaleId' || name === 'inventoryId' || name === 'sourcePointOfSaleId' || name === 'destinationPointOfSaleId' 
          ? Number(value) 
          : value
      };
      
      // Si cambia el tipo de transacción, resetear campos dependientes
      if (name === 'transactionType') {
        newData.pointOfSaleId = 0;
        newData.destinationPointOfSaleId = 0;
        newData.paymentMethod = ''; // Resetear método de pago
        newData.discount = '0'; // Resetear descuento
        setProductSearchQuery('');
        setSearchResults([]);
        setSelectedProduct(null);
        setTransactionItems([]); // Limpiar items
      }
      
      // Si cambia el punto de venta, resetear campos dependientes
      if (name === 'pointOfSaleId') {
        setProductSearchQuery('');
        setSearchResults([]);
        setSelectedProduct(null);
        setTransactionItems([]); // Limpiar items
        // También resetear el destino si es una transferencia
        if (newData.transactionType === 'transfer') {
          newData.destinationPointOfSaleId = 0;
        }
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        transactionType: formData.transactionType,
        remarks: formData.remarks,
        items: transactionItems.map(item => {
          // Para reabastecimiento, siempre usar productId con pointOfSaleId (ya que buscamos productos generales)
          if (formData.transactionType === 'restock') {
            // Para restock, siempre usar productId ya que buscamos en productos generales
            // inventoryId será 0 para productos nuevos, así que verificamos productId
            if (item.productId && item.inventoryId === 0) {
              return {
                productId: item.productId,
                pointOfSaleId: formData.pointOfSaleId,
                quantity: item.quantity,
              };
            } else if (item.inventoryId && item.inventoryId > 0) {
              // Si el producto ya está en inventario (caso raro pero posible)
              return {
                inventoryId: item.inventoryId,
                quantity: item.quantity,
              };
            } else {
              // Fallback: intentar con productId si existe
              return {
                productId: item.productId,
                pointOfSaleId: formData.pointOfSaleId,
                quantity: item.quantity,
              };
            }
          } else {
            // Para otros tipos, usar inventoryId
            return {
              inventoryId: item.inventoryId,
              quantity: item.quantity,
            };
          }
        }),
        ...(formData.transactionType === 'sale' && {
          ...(formData.paymentMethod && {
            paymentMethod: formData.paymentMethod === 'qr' ? 'transfer' : formData.paymentMethod,
          }),
          discount: parseFloat(formData.discount) || 0,
        }),
        ...(formData.transactionType === 'transfer' && {
          sourcePointOfSaleId: formData.pointOfSaleId, // El origen es el punto de venta seleccionado
          destinationPointOfSaleId: formData.destinationPointOfSaleId,
        }),
      };
      onSubmit(submissionData);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  // Obtener puntos de venta que tienen inventario
  const pointsOfSaleWithInventory = pointsOfSale.filter(pos => 
    inventories.some(inv => inv.pointOfSaleId === pos.id)
  );
  
  // Para transferencias: origen debe tener inventario, destino puede ser cualquiera
  // Para otros tipos, usar solo los que tienen inventario
  const availablePointsOfSale = formData.transactionType === 'transfer' 
    ? pointsOfSaleWithInventory  // Origen debe tener inventario
    : pointsOfSaleWithInventory;

  // Manejar selección de producto del dropdown
  const handleProductSelect = (product: SearchInventoryResult) => {
    // Limpiar timeout de búsqueda si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSelectedProduct(product);
    setProductSearchQuery(product.productName || '');
    setShowDropdown(false);
    setSearchResults([]);
    setIsSearching(false);
    // Resetear cantidad: 1 para otros tipos, 0 para ajustes (permite negativos)
    setItemQuantity(formData.transactionType === 'adjustment' ? '0' : '1');
  };

  // Agregar item a la lista de transacción
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const quantityValue = parseInt(itemQuantity) || 0;
    
    // Verificar si el item ya existe en la lista
    // Para reabastecimiento, comparar por productId; para otros tipos, por inventoryId
    const existingItemIndex = transactionItems.findIndex(
      item => formData.transactionType === 'restock' && item.productId
        ? item.productId === selectedProduct.productId
        : item.inventoryId === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // Si existe, actualizar la cantidad
      const newItems = [...transactionItems];
      newItems[existingItemIndex].quantity += quantityValue;
      setTransactionItems(newItems);
    } else {
      // Si no existe, agregarlo
      const newItem: TransactionItem = {
        // Para reabastecimiento de productos nuevos (que no están en inventario), usar productId
        // Para otros casos, usar inventoryId
        inventoryId: formData.transactionType === 'restock' ? 0 : selectedProduct.id,
        productId: formData.transactionType === 'restock' ? selectedProduct.productId : undefined,
        quantity: quantityValue,
        productName: selectedProduct.productName,
        productSku: selectedProduct.productSku,
        barcode: selectedProduct.barcode,
        stockQuantity: selectedProduct.stockQuantity,
        price: selectedProduct.price,
      };
      setTransactionItems([...transactionItems, newItem]);
    }

    // Limpiar selección
    setSelectedProduct(null);
    setProductSearchQuery('');
    // Resetear cantidad: 1 para otros tipos, 0 para ajustes (permite negativos)
    setItemQuantity(formData.transactionType === 'adjustment' ? '0' : '1');
  };

  // Eliminar item de la lista
  const handleRemoveItem = (inventoryId: number) => {
    setTransactionItems(transactionItems.filter(item => item.inventoryId !== inventoryId));
  };

  // Actualizar cantidad de un item
  const handleUpdateItemQuantity = (inventoryId: number, newQuantity: number) => {
    // Para ajustes, permitir valores negativos y cero
    // Para otros tipos, solo permitir valores positivos
    if (formData.transactionType !== 'adjustment' && newQuantity <= 0) {
      handleRemoveItem(inventoryId);
      return;
    }
    
    setTransactionItems(transactionItems.map(item => 
      item.inventoryId === inventoryId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Manejar cambio en el campo de búsqueda
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || '';
    setProductSearchQuery(value);
    
    // Si se borra el texto, limpiar selección
    if (!value.trim()) {
      setSelectedProduct(null);
      setFormData(prev => ({ ...prev, inventoryId: 0 }));
      setSearchResults([]);
      setShowDropdown(false);
    } else {
      // Solo mostrar dropdown si hay resultados o si está buscando
      setShowDropdown(true);
    }
  };

  return (
    <>
      {/* Estilos para la animación del spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>{title}</h2>

      <form onSubmit={handleSubmit}>
        {/* Tipo de transacción */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="transactionType" style={formStyles.label}>
            <FaExchangeAlt style={{ marginRight: '8px' }} />
            Tipo de Transacción *
          </label>
          <select
            id="transactionType"
            name="transactionType"
            value={formData.transactionType}
            onChange={handleChange}
            onFocus={() => handleFocus('transactionType')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.transactionType, focusedField === 'transactionType', theme)}
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.transactionType && (
            <div style={formStyles.errorMessage}>
              <span>{errors.transactionType}</span>
            </div>
          )}
          
          {/* Descripción del tipo seleccionado */}
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: `1px solid ${theme.primaryColor}30`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: theme.textSecondary,
          }}>
            <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
            {transactionTypes.find(t => t.value === formData.transactionType)?.description}
          </div>

          {/* Mensaje informativo para usuarios normales */}
          {!isAdmin && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${theme.warning}30`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: theme.warning,
            }}>
              <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
              <strong>Restricción de usuario:</strong> Solo puedes crear transacciones de venta y ajuste.
            </div>
          )}
        </div>

        {/* Selección de punto de venta */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="pointOfSaleId" style={formStyles.label}>
            <FaStore style={{ marginRight: '8px' }} />
            {formData.transactionType === 'transfer' ? 'Punto de Venta Origen *' : 'Punto de Venta *'}
          </label>
          <select
            id="pointOfSaleId"
            name="pointOfSaleId"
            value={formData.pointOfSaleId}
            onChange={handleChange}
            onFocus={() => handleFocus('pointOfSaleId')}
            onBlur={handleBlur}
            style={{
              ...getSelectStyles(!!errors.pointOfSaleId, focusedField === 'pointOfSaleId', theme),
              opacity: formData.transactionType ? 1 : 0.6,
            }}
            disabled={!formData.transactionType}
          >
            <option value={0}>
              {formData.transactionType 
                ? formData.transactionType === 'transfer'
                  ? 'Seleccione el punto de venta origen'
                  : 'Seleccione un punto de venta'
                : 'Primero seleccione un tipo de transacción'
              }
            </option>
            {availablePointsOfSale.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
          {errors.pointOfSaleId && (
            <div style={formStyles.errorMessage}>
              <span>{errors.pointOfSaleId}</span>
            </div>
          )}
        </div>

        {/* Selección de punto de venta destino (solo para transferencias) */}
        {formData.transactionType === 'transfer' && (
        <div style={formStyles.fieldContainer}>
            <label htmlFor="destinationPointOfSaleId" style={formStyles.label}>
              <FaStore style={{ marginRight: '8px' }} />
              Punto de Venta Destino *
          </label>
          <select
              id="destinationPointOfSaleId"
              name="destinationPointOfSaleId"
              value={formData.destinationPointOfSaleId}
            onChange={handleChange}
              onFocus={() => handleFocus('destinationPointOfSaleId')}
            onBlur={handleBlur}
            style={{
                ...getSelectStyles(!!errors.destinationPointOfSaleId, focusedField === 'destinationPointOfSaleId', theme),
              opacity: formData.pointOfSaleId ? 1 : 0.6,
            }}
            disabled={!formData.pointOfSaleId}
          >
            <option value={0}>
              {formData.pointOfSaleId 
                  ? 'Seleccione el punto de venta destino'
                  : 'Primero seleccione el punto de venta origen'
              }
            </option>
              {pointsOfSale
                .filter(pos => pos.id !== formData.pointOfSaleId) // Excluir el punto de venta origen
                .map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
              </option>
            ))}
          </select>
            {errors.destinationPointOfSaleId && (
            <div style={formStyles.errorMessage}>
                <span>{errors.destinationPointOfSaleId}</span>
            </div>
          )}
            </div>
          )}

        {/* Búsqueda de producto en inventario */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="productSearch" style={formStyles.label}>
            <FaBox style={{ marginRight: '8px' }} />
            Producto en Inventario *
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.textSecondary,
                fontSize: '0.9rem',
                pointerEvents: 'none',
              }} />
              <input
                ref={searchInputRef}
                type="text"
                id="productSearch"
                name="productSearch"
                value={productSearchQuery || ''}
                onChange={handleProductSearchChange}
                onFocus={() => {
                  handleFocus('inventoryId');
                  if (searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={(e) => {
                  // No cerrar el dropdown inmediatamente, dar tiempo para hacer click
                  setTimeout(() => {
                    if (!dropdownRef.current?.contains(document.activeElement)) {
                      handleBlur();
                    }
                  }, 200);
                }}
                style={{
                  ...getInputStyles(!!errors.inventoryId, focusedField === 'inventoryId', theme),
                  paddingLeft: '40px',
                  opacity: formData.pointOfSaleId && formData.transactionType && (formData.transactionType !== 'transfer' || formData.destinationPointOfSaleId) ? 1 : 0.6,
                  cursor: formData.pointOfSaleId && formData.transactionType && (formData.transactionType !== 'transfer' || formData.destinationPointOfSaleId) ? 'text' : 'not-allowed',
                }}
                disabled={!formData.pointOfSaleId || !formData.transactionType || (formData.transactionType === 'transfer' && !formData.destinationPointOfSaleId)}
                placeholder={
                  !formData.transactionType 
                    ? 'Primero seleccione un tipo de transacción'
                    : !formData.pointOfSaleId
                    ? 'Primero seleccione un punto de venta'
                    : formData.transactionType === 'transfer' && !formData.destinationPointOfSaleId
                    ? 'Primero seleccione el punto de venta destino'
                    : formData.transactionType === 'restock'
                    ? 'Buscar producto general...'
                    : 'Buscar producto por nombre o SKU...'
                }
              />
              {isSearching && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${theme.primaryColor}30`,
                  borderTopColor: theme.primaryColor,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
            </div>

            {/* Dropdown de resultados */}
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                }}
              >
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.borderColor}`,
                      transition: 'background-color 0.2s ease',
                      backgroundColor: selectedProduct?.id === product.id 
                        ? `${theme.primaryColor}15` 
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${theme.primaryColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = selectedProduct?.id === product.id 
                        ? `${theme.primaryColor}15` 
                        : 'transparent';
                    }}
                  >
          <div style={{
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '4px',
                    }}>
                      {product.productName}
                    </div>
                    <div style={{
            fontSize: '0.85rem',
            color: theme.textSecondary,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}>
                      <span>SKU: {product.productSku}</span>
                      {product.barcode && (
                        <span>Código de Barras: {product.barcode}</span>
                      )}
          </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {showDropdown && !isSearching && (productSearchQuery || '').trim().length >= 2 && searchResults.length === 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  padding: '16px',
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  textAlign: 'center',
                  color: theme.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                No se encontraron productos con "{productSearchQuery || ''}"
              </div>
            )}
          </div>

          {errors.inventoryId && (
            <div style={formStyles.errorMessage}>
              <span>{errors.inventoryId}</span>
            </div>
          )}

          {/* Información del producto seleccionado y agregar a lista */}
          {selectedProduct && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${theme.success}30`,
              borderRadius: '8px',
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem', color: theme.success }} />
                  <strong style={{ color: theme.success }}>Producto seleccionado:</strong>
                </div>
                <div style={{ marginLeft: '20px', color: theme.textPrimary }}>
                  <div><strong>{selectedProduct.productName}</strong> (SKU: {selectedProduct.productSku})</div>
                  {selectedProduct.barcode && (
                    <div style={{ fontSize: '0.85rem', color: theme.textSecondary }}>
                      Código de Barras: {selectedProduct.barcode}
            </div>
          )}
                  <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                    Stock disponible: <strong>{selectedProduct.stockQuantity} unidades</strong>
                    {formData.transactionType === 'adjustment' && (
                      <div style={{ marginTop: '4px', fontSize: '0.8rem', color: theme.warning }}>
                        💡 Para ajustes, puedes usar valores negativos (ej: -5) para reducir el stock
                      </div>
                    )}
                  </div>
                </div>
        </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...formStyles.label, fontSize: '0.85rem', marginBottom: '4px' }}>
                    Cantidad {formData.transactionType === 'adjustment' && '(puede ser negativa)'}
          </label>
          <input
            type="text"
                    value={itemQuantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir números, signo negativo y vacío (para poder borrar)
                      if (value === '' || /^-?\d*$/.test(value)) {
                        setItemQuantity(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Validar y normalizar al perder el foco
                      const numValue = parseInt(e.target.value) || 0;
                      if (formData.transactionType === 'adjustment') {
                        setItemQuantity(numValue.toString());
                      } else {
                        const validValue = Math.max(1, numValue);
                        setItemQuantity(validValue.toString());
                      }
                    }}
                    style={{
                      ...getInputStyles(false, false, theme),
                      width: '100%',
                    }}
                    placeholder={formData.transactionType === 'adjustment' ? 'Ej: -5, 0, 10' : '1'}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.white,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryColor;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryColor;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaPlus />
                  Agregar
                </button>
              </div>
            </div>
          )}
          
          {/* Mensaje informativo sobre el debounce */}
          {formData.pointOfSaleId && formData.transactionType && !selectedProduct && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: `1px solid ${theme.primaryColor}30`,
                  borderRadius: '6px',
                  fontSize: '0.85rem',
              color: theme.textSecondary,
                }}>
                  <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
              Escribe al menos 2 caracteres para buscar productos
                </div>
          )}
        </div>

        {/* Lista de items agregados */}
        {transactionItems.length > 0 && (
            <div style={formStyles.fieldContainer}>
              <label style={formStyles.label}>
              <FaBox style={{ marginRight: '8px' }} />
              Items de la Transacción ({transactionItems.length})
              </label>
              <div style={{
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              {transactionItems.map((item, index) => (
                <div
                  key={item.inventoryId}
                  style={{
                    padding: '16px',
                    borderBottom: index < transactionItems.length - 1 ? `1px solid ${theme.borderColor}` : 'none',
                    backgroundColor: theme.cardBackground,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                      {item.productName}
              </div>
                    <div style={{ fontSize: '0.85rem', color: theme.textSecondary }}>
                      SKU: {item.productSku}
                      {item.barcode && ` • Código de Barras: ${item.barcode}`}
              </div>
                    <div style={{ fontSize: '0.8rem', color: theme.textSecondary, marginTop: '4px' }}>
                      Stock disponible: {item.stockQuantity} unidades
            </div>
                    {errors[`item_${index}`] && (
                      <div style={{ fontSize: '0.8rem', color: theme.error, marginTop: '4px' }}>
                        {errors[`item_${index}`]}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: theme.textSecondary }}>Cantidad:</label>
                      <input
                        type="number"
                        min={formData.transactionType === 'adjustment' ? undefined : '1'}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          // Para ajustes, permitir cualquier valor
                          // Para otros tipos, forzar mínimo 1
                          if (formData.transactionType === 'adjustment') {
                            handleUpdateItemQuantity(item.inventoryId, value);
                          } else {
                            handleUpdateItemQuantity(item.inventoryId, Math.max(1, value));
                          }
                        }}
                        style={{
                          ...getInputStyles(false, false, theme),
                          width: '80px',
                          textAlign: 'center',
                        }}
                        placeholder={formData.transactionType === 'adjustment' ? 'Ej: -5' : '1'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.inventoryId)}
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.error}`,
                        color: theme.error,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${theme.error}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FaTrash />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Método de pago (solo para ventas) */}
        {formData.transactionType === 'sale' && (
            <div style={formStyles.fieldContainer}>
            <label htmlFor="paymentMethod" style={formStyles.label}>
              <FaCreditCard style={{ marginRight: '8px' }} />
              Método de Pago *
              </label>
              <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
                onChange={handleChange}
              onFocus={() => handleFocus('paymentMethod')}
                onBlur={handleBlur}
              style={getSelectStyles(!!errors.paymentMethod, focusedField === 'paymentMethod', theme)}
            >
              <option value="">Seleccione un método de pago</option>
              <option value="card">Tarjeta</option>
              <option value="qr">Pago con QR</option>
              <option value="cash">Efectivo</option>
              </select>
            {errors.paymentMethod && (
                <div style={formStyles.errorMessage}>
                <span>{errors.paymentMethod}</span>
                </div>
              )}
          </div>
        )}

        {/* Descuento (solo para ventas) */}
        {formData.transactionType === 'sale' && (
          <div style={formStyles.fieldContainer}>
            <label htmlFor="discount" style={formStyles.label}>
              <FaDollarSign style={{ marginRight: '8px' }} />
              Descuento (en pesos)
            </label>
            <input
              type="text"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={(e) => {
                const value = e.target.value;
                // Permitir solo números, punto decimal y vacío (para poder borrar)
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleChange(e);
                }
              }}
              onFocus={() => handleFocus('discount')}
              onBlur={(e) => {
                // Validar y normalizar al perder el foco
                const numValue = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ ...prev, discount: numValue.toString() }));
                handleBlur();
              }}
              style={getInputStyles(!!errors.discount, focusedField === 'discount', theme)}
              placeholder="0"
            />
            {errors.discount && (
              <div style={formStyles.errorMessage}>
                <span>{errors.discount}</span>
              </div>
            )}
            {transactionItems.length > 0 && (
              <div style={{
                marginTop: '8px',
                fontSize: '0.85rem',
                color: theme.textSecondary,
              }}>
                Monto total: {transactionItems.reduce((total, item) => {
                  const itemPrice = item.price || 0;
                  const itemQuantity = item.quantity || 0;
                  return total + (itemPrice * itemQuantity);
                }, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            )}
          </div>
        )}

        {/* Comentarios */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="remarks" style={formStyles.label}>
            Comentarios *
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onFocus={() => handleFocus('remarks')}
            onBlur={handleBlur}
            style={getTextareaStyles(!!errors.remarks, focusedField === 'remarks', theme)}
            placeholder="Describa la transacción (ej: Venta a cliente, Reabastecimiento desde proveedor, etc.)"
            rows={3}
          />
          {errors.remarks && (
            <div style={formStyles.errorMessage}>
              <span>{errors.remarks}</span>
            </div>
          )}
        </div>

        {/* Total a pagar (solo para ventas) */}
        {formData.transactionType === 'sale' && transactionItems.length > 0 && (() => {
          const subtotal = transactionItems.reduce((total, item) => {
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 0;
            return total + (itemPrice * itemQuantity);
          }, 0);
          const discount = parseFloat(formData.discount) || 0;
          const total = Math.max(0, subtotal - discount);
          
          return (
            <div style={formStyles.fieldContainer}>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: `2px solid ${theme.success}40`,
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: discount > 0 ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaDollarSign style={{ 
                      fontSize: '1.5rem', 
                      color: theme.success,
                    }} />
                    <div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: theme.textSecondary,
                        marginBottom: '4px',
                      }}>
                        Total a Pagar
                      </div>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: theme.success,
                      }}>
                        {total.toLocaleString('es-CO', { 
                          style: 'currency', 
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: theme.textSecondary,
                    textAlign: 'right',
                  }}>
                    <div>{transactionItems.length} {transactionItems.length === 1 ? 'producto' : 'productos'}</div>
                    <div style={{ marginTop: '4px' }}>
                      {transactionItems.reduce((total, item) => total + (item.quantity || 0), 0)} {transactionItems.reduce((total, item) => total + (item.quantity || 0), 0) === 1 ? 'unidad' : 'unidades'}
                    </div>
                  </div>
                </div>
                {discount > 0 && (
                  <div style={{
                    paddingTop: '12px',
                    borderTop: `1px solid ${theme.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                  }}>
                    <div style={{ color: theme.textSecondary }}>
                      Subtotal:
                    </div>
                    <div style={{ color: theme.textPrimary, fontWeight: '600' }}>
                      {subtotal.toLocaleString('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    marginTop: '4px',
                  }}>
                    <div style={{ color: theme.error }}>
                      Descuento:
                    </div>
                    <div style={{ color: theme.error, fontWeight: '600' }}>
                      -{discount.toLocaleString('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
          <button
            type="button"
            onClick={onCancel}
            style={formStyles.secondaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaTimes />
            Cancelar
          </button>
          <button
            type="submit"
            style={formStyles.primaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaSave />
            Crear Transacción
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default TransactionForm;
