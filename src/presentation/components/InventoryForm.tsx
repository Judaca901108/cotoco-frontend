import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaTimes, FaBox, FaWarehouse, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import colors from '../../shared/colors';
import { API_BASE_URL } from '../../config/apiConfig';

type SearchProductResult = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  barcode?: string;
  stockQuantity: number;
  minimumStock: number;
  onDisplay: number;
};

type InventoryFormProps = {
  initialData?: { productId: number; stockQuantity: number; minimumStock: number; onDisplay?: number };
  products: { id: number; name: string }[]; // Lista de productos disponibles (mantener para compatibilidad)
  pointOfSaleId: number; // ID del punto de venta para la búsqueda
  onSubmit: (data: { productId: number; stockQuantity: number; minimumStock: number; onDisplay: number }) => void;
  onCancel?: () => void;
  title?: string;
};
  

const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  products,
  pointOfSaleId,
  onSubmit,
  onCancel,
  title = "Gestión de Inventario"
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      productId: 0,
      stockQuantity: 0,
      minimumStock: 0,
      onDisplay: 0,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Estados para búsqueda de productos
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchProductResult | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.productId) newErrors.productId = 'El producto es obligatorio.';
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'La cantidad no puede ser negativa.';
    if (formData.minimumStock < 0) newErrors.minimumStock = 'El stock mínimo no puede ser negativo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'stockQuantity' || name === 'minimumStock' || name === 'onDisplay' ? Number(value) : value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Asegurar que onDisplay siempre sea 0 para nuevos inventarios
      onSubmit({ ...formData, onDisplay: 0 });
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

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
        // Formatear los datos para que coincidan con el tipo SearchProductResult
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

    // Si hay un punto de venta seleccionado y hay texto de búsqueda (mínimo 2 caracteres)
    if (pointOfSaleId && trimmedQuery.length >= 2) {
      // Esperar 2 segundos antes de buscar
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(pointOfSaleId, trimmedQuery);
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
  }, [productSearchQuery, pointOfSaleId]);

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

  // Manejar selección de producto del dropdown
  const handleProductSelect = (product: SearchProductResult) => {
    // Limpiar timeout de búsqueda si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSelectedProduct(product);
    setProductSearchQuery(product.productName || '');
    setFormData(prev => ({ ...prev, productId: product.productId }));
    setShowDropdown(false);
    setSearchResults([]);
    setIsSearching(false);
    
    // Limpiar error si existe
    if (errors.productId) {
      setErrors(prev => ({ ...prev, productId: '' }));
    }
  };

  // Manejar cambio en el campo de búsqueda
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || '';
    setProductSearchQuery(value);
    
    // Si se borra el texto, limpiar selección
    if (!value.trim()) {
      setSelectedProduct(null);
      setFormData(prev => ({ ...prev, productId: 0 }));
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
          {/* Producto - Búsqueda */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="productSearch" style={formStyles.label}>
              <FaBox style={{ marginRight: '8px' }} />
              Producto *
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
                    handleFocus('productId');
                    if (searchResults.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={(e) => {
                    // No cerrar el dropdown inmediatamente, dar tiempo para hacer click
                    setTimeout(() => {
                      if (!dropdownRef.current?.contains(document.activeElement)) {
                        handleBlur();
                        setShowDropdown(false);
                      }
                    }, 200);
                  }}
                  style={{
                    ...getInputStyles(!!errors.productId, focusedField === 'productId'),
                    paddingLeft: '40px',
                  }}
                  placeholder="Buscar producto por nombre o SKU (espera 2 segundos después de escribir)..."
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

            {/* Información del producto seleccionado */}
            {selectedProduct && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${colors.success}30`,
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: colors.textPrimary,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem', color: colors.success }} />
                  <strong style={{ color: colors.success }}>Producto seleccionado:</strong>
                </div>
                <div style={{ marginLeft: '20px' }}>
                  <div><strong>{selectedProduct.productName}</strong> (SKU: {selectedProduct.productSku})</div>
                  {selectedProduct.barcode && (
                    <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '2px' }}>
                      Código de Barras: {selectedProduct.barcode}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje informativo sobre el debounce */}
            {!selectedProduct && (
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

            {errors.productId && (
              <div style={formStyles.errorMessage}>
                <span>{errors.productId}</span>
              </div>
            )}
          </div>

        {/* Cantidad en Inventario y Stock Mínimo en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="stockQuantity" style={formStyles.label}>
              <FaWarehouse style={{ marginRight: '8px' }} />
              Cantidad en Inventario *
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              onFocus={() => handleFocus('stockQuantity')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.stockQuantity, focusedField === 'stockQuantity')}
              placeholder="0"
              min="0"
            />
            {errors.stockQuantity && (
              <div style={formStyles.errorMessage}>
                <span>{errors.stockQuantity}</span>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="minimumStock" style={formStyles.label}>
              Stock Mínimo *
            </label>
            <input
              type="number"
              id="minimumStock"
              name="minimumStock"
              value={formData.minimumStock}
              onChange={handleChange}
              onFocus={() => handleFocus('minimumStock')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.minimumStock, focusedField === 'minimumStock')}
              placeholder="0"
              min="0"
            />
            {errors.minimumStock && (
              <div style={formStyles.errorMessage}>
                <span>{errors.minimumStock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: `1px solid ${formStyles.input.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: formStyles.label.color,
            margin: '0 0 8px 0',
          }}>
            Información del Inventario
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: formStyles.errorMessage.color,
            margin: 0,
          }}>
            • La cantidad en inventario representa el stock actual disponible<br/>
            • El stock mínimo es el nivel por debajo del cual se debe reabastecer
          </p>
        </div>

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
          {onCancel && (
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
          )}
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
            Guardar Inventario
          </button>
        </div>
      </form>
      </div>
    </>
  );
};

export default InventoryForm;
