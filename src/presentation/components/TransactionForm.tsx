import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaTimes, FaBox, FaStore, FaExchangeAlt, FaInfoCircle, FaSearch, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles, getTextareaStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
import colors from '../../shared/colors';
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
  quantity: number;
  productName: string;
  productSku: string;
  barcode?: string;
  stockQuantity: number;
};

type TransactionFormProps = {
  inventories: Inventory[];
  onSubmit: (data: {
    transactionType: 'sale' | 'restock' | 'adjustment' | 'transfer';
    remarks: string;
    items: Array<{
      inventoryId: number;
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
  const [formData, setFormData] = useState({
    pointOfSaleId: 0,
    transactionType: 'sale' as 'sale' | 'restock' | 'adjustment' | 'transfer',
    remarks: '',
    destinationPointOfSaleId: 0,
  });

  // Estado para la lista de items de la transacción
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

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

  // Función para buscar productos en el inventario del punto de venta
  const searchProducts = async (pointOfSaleId: number, query: string) => {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/point-of-sale/${pointOfSaleId}/inventory/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Asegurarse de que los datos tengan la estructura correcta
        const formattedData = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          productId: item.productId || item.product?.id,
          productName: item.productName || item.product?.name || 'Producto sin nombre',
          productSku: item.productSku || item.product?.sku || 'N/A',
          barcode: item.barcode || item.product?.barcode || undefined,
          stockQuantity: item.stockQuantity || item.stock || 0,
          minimumStock: item.minimumStock || 0,
          onDisplay: item.onDisplay || 0,
        }));
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

  // Efecto para manejar el debounce de búsqueda (2 segundos)
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Verificación de seguridad para productSearchQuery
    const query = productSearchQuery || '';
    const trimmedQuery = query.trim();

    // Si hay un tipo de transacción, punto de venta seleccionado y hay texto de búsqueda (mínimo 2 caracteres)
    // Y no hay un producto seleccionado (para evitar buscar cuando se selecciona)
    if (formData.transactionType && formData.pointOfSaleId && trimmedQuery.length >= 2 && !selectedProduct) {
      // Esperar 2 segundos antes de buscar
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(formData.pointOfSaleId, trimmedQuery);
      }, 2000);
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
    { value: 'adjustment', label: 'Ajuste', description: 'Corrección de inventario (productos dañados, pérdidas, etc.)' },
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
        items: transactionItems.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
        })),
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
    setItemQuantity(1); // Resetear cantidad a 1
  };

  // Agregar item a la lista de transacción
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    // Verificar si el item ya existe en la lista
    const existingItemIndex = transactionItems.findIndex(
      item => item.inventoryId === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // Si existe, actualizar la cantidad
      const newItems = [...transactionItems];
      newItems[existingItemIndex].quantity += itemQuantity;
      setTransactionItems(newItems);
    } else {
      // Si no existe, agregarlo
      const newItem: TransactionItem = {
        inventoryId: selectedProduct.id,
        quantity: itemQuantity,
        productName: selectedProduct.productName,
        productSku: selectedProduct.productSku,
        barcode: selectedProduct.barcode,
        stockQuantity: selectedProduct.stockQuantity,
      };
      setTransactionItems([...transactionItems, newItem]);
    }

    // Limpiar selección
    setSelectedProduct(null);
    setProductSearchQuery('');
    setItemQuantity(1);
  };

  // Eliminar item de la lista
  const handleRemoveItem = (inventoryId: number) => {
    setTransactionItems(transactionItems.filter(item => item.inventoryId !== inventoryId));
  };

  // Actualizar cantidad de un item
  const handleUpdateItemQuantity = (inventoryId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
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
            style={getSelectStyles(!!errors.transactionType, focusedField === 'transactionType')}
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
            border: `1px solid ${colors.primaryColor}30`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: colors.textSecondary,
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
              border: `1px solid ${colors.warning}30`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: colors.warning,
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
              ...getSelectStyles(!!errors.pointOfSaleId, focusedField === 'pointOfSaleId'),
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
            {pointsOfSaleWithInventory.map((pos) => (
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
                ...getSelectStyles(!!errors.destinationPointOfSaleId, focusedField === 'destinationPointOfSaleId'),
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
              {pointsOfSaleWithInventory
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
                color: colors.textSecondary,
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
                  ...getInputStyles(!!errors.inventoryId, focusedField === 'inventoryId'),
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
                    : 'Buscar producto por nombre o SKU (espera 2 segundos después de escribir)...'
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
                  border: `2px solid ${colors.primaryColor}30`,
                  borderTopColor: colors.primaryColor,
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
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.borderColor}`,
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
                      borderBottom: `1px solid ${colors.borderColor}`,
                      transition: 'background-color 0.2s ease',
                      backgroundColor: selectedProduct?.id === product.id 
                        ? `${colors.primaryColor}15` 
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.primaryColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = selectedProduct?.id === product.id 
                        ? `${colors.primaryColor}15` 
                        : 'transparent';
                    }}
                  >
                    <div style={{
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginBottom: '4px',
                    }}>
                      {product.productName}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: colors.textSecondary,
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
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  textAlign: 'center',
                  color: colors.textSecondary,
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
              border: `1px solid ${colors.success}30`,
              borderRadius: '8px',
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem', color: colors.success }} />
                  <strong style={{ color: colors.success }}>Producto seleccionado:</strong>
                </div>
                <div style={{ marginLeft: '20px', color: colors.textPrimary }}>
                  <div><strong>{selectedProduct.productName}</strong> (SKU: {selectedProduct.productSku})</div>
                  {selectedProduct.barcode && (
                    <div style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
                      Código de Barras: {selectedProduct.barcode}
                    </div>
                  )}
                  <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                    Stock disponible: <strong>{selectedProduct.stockQuantity} unidades</strong>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...formStyles.label, fontSize: '0.85rem', marginBottom: '4px' }}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      ...getInputStyles(false, false),
                      width: '100%',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    backgroundColor: colors.primaryColor,
                    color: colors.white,
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
                    e.currentTarget.style.backgroundColor = colors.primaryColor;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryColor;
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
              border: `1px solid ${colors.primaryColor}30`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: colors.textSecondary,
            }}>
              <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
              Escribe al menos 2 caracteres y espera 2 segundos para buscar productos
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
              border: `1px solid ${colors.borderColor}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              {transactionItems.map((item, index) => (
                <div
                  key={item.inventoryId}
                  style={{
                    padding: '16px',
                    borderBottom: index < transactionItems.length - 1 ? `1px solid ${colors.borderColor}` : 'none',
                    backgroundColor: colors.cardBackground,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '4px' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
                      SKU: {item.productSku}
                      {item.barcode && ` • Código de Barras: ${item.barcode}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '4px' }}>
                      Stock disponible: {item.stockQuantity} unidades
                    </div>
                    {errors[`item_${index}`] && (
                      <div style={{ fontSize: '0.8rem', color: colors.error, marginTop: '4px' }}>
                        {errors[`item_${index}`]}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Cantidad:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemQuantity(item.inventoryId, parseInt(e.target.value) || 1)}
                        style={{
                          ...getInputStyles(false, false),
                          width: '80px',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.inventoryId)}
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.error}`,
                        color: colors.error,
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
                        e.currentTarget.style.backgroundColor = `${colors.error}10`;
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
            style={getTextareaStyles(!!errors.remarks, focusedField === 'remarks')}
            placeholder="Describa la transacción (ej: Venta a cliente, Reabastecimiento desde proveedor, etc.)"
            rows={3}
          />
          {errors.remarks && (
            <div style={formStyles.errorMessage}>
              <span>{errors.remarks}</span>
            </div>
          )}
        </div>

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
