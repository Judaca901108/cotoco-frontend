import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { FaPlus, FaSearch, FaBox, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaPrint } from 'react-icons/fa';
import Barcode from 'react-barcode';
import ModalComponent from '../components/ModalComponent';
import ProductForm from '../components/ProductForm';
import { authenticatedFetch } from '../../infrastructure/authService';
import { getTableStyles, getRowStyle, getStatusBadgeStyle } from '../../shared/tableStyles';
import { useTheme } from '../../application/contexts/ThemeContext';
import { API_BASE_URL, getImageUrl } from '../../config/apiConfig';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
  subcategory?: string; // Subcategoría
  imagePath?: string; // URL de la imagen
  barcode?: string; // Código de barras
};

const BASE_PATH = API_BASE_URL;

const ProductsPage: React.FC = () => {
  const { theme } = useTheme();
  const tableStyles = getTableStyles(theme);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('order', order);
    }
    const url = `${BASE_PATH}/product${params.toString() ? `?${params.toString()}` : ''}`;
    
    authenticatedFetch(url)
      .then((res) => res.json())
      .then((data) => {
        const parsedProducts = data.map((product: any) => ({
          ...product,
          price: parseFloat(product.price), // Convertimos `price` a número
        }));
        setProducts(parsedProducts);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, [sortBy, order]);


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
    setCurrentPage(1); // Resetear a la primera página
  };

  // Obtener icono de ordenamiento
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <FaSort style={{ marginLeft: '4px', opacity: 0.3 }} />;
    }
    return order === 'asc' 
      ? <FaSortUp style={{ marginLeft: '4px', color: theme.primaryColor }} />
      : <FaSortDown style={{ marginLeft: '4px', color: theme.primaryColor }} />;
  };

  const handleCreateProduct = async (data: { name: string; description: string; price: number; sku: string; category: string; barcode?: string; subcategory?: string; number_of_piece?: string; image?: File }) => {
    try {
      console.log('Datos recibidos:', data);
      
      // Si hay imagen, usar FormData (multipart/form-data)
      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('sku', data.sku);
        formData.append('category', data.category);
        if (data.barcode) {
          formData.append('barcode', data.barcode);
        }
        if (data.subcategory) {
          formData.append('subcategory', data.subcategory);
        }
        if (data.number_of_piece !== undefined) {
          formData.append('number_of_piece', data.number_of_piece);
        }
        formData.append('image', data.image);
        
        console.log('Enviando con FormData (con imagen)');
        console.log('Imagen:', data.image.name, data.image.size, 'bytes');
        
        const res = await authenticatedFetch(`${BASE_PATH}/product`, {
          method: 'POST',
          body: formData,
          // NO establecer Content-Type - se establece automáticamente con FormData
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || `Error ${res.status}: ${res.statusText}`;
          throw new Error(errorMessage);
        }
        
        const newProduct = await res.json();
        newProduct.price = parseFloat(newProduct.price);
        setProducts((prev) => [...prev, newProduct]);
        setIsCreating(false);
        setError('');
      } else {
        // Sin imagen, enviar como JSON (application/json)
        const jsonData: any = {
          name: data.name,
          description: data.description,
          price: data.price,
          sku: data.sku,
          category: data.category,
        };
        if (data.barcode) {
          jsonData.barcode = data.barcode;
        }
        if (data.subcategory) {
          jsonData.subcategory = data.subcategory;
        }
        if (data.number_of_piece !== undefined) {
          jsonData.number_of_piece = String(data.number_of_piece);
        }
        
        console.log('Enviando como JSON (sin imagen):', jsonData);
        
        const res = await authenticatedFetch(`${BASE_PATH}/product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || `Error ${res.status}: ${res.statusText}`;
          throw new Error(errorMessage);
        }
        
        const newProduct = await res.json();
        newProduct.price = parseFloat(newProduct.price);
        setProducts((prev) => [...prev, newProduct]);
        setIsCreating(false);
        setError('');
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message);
    }
  };
  

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.subcategory && product.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={tableStyles.pageContainer} className="page-container-responsive">
      {/* Header de la página */}
      <div style={tableStyles.pageHeader} className="page-header-responsive">
        <h1 style={tableStyles.pageTitle} className="page-title-responsive">Productos</h1>
        <button
          style={tableStyles.createButton}
          onClick={() => setIsCreating(true)}
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
          Crear Producto
        </button>
      </div>

      {/* Contenedor de la tabla */}
      <div style={tableStyles.tableContainer} className="table-container-responsive">
        {/* Tabla */}
        <table style={tableStyles.table} className="table-responsive">
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Imagen</th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('name')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Nombre
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('category')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Categoría
                  {getSortIcon('category')}
                </div>
              </th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Subcategoría</th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('price')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Precio
                  {getSortIcon('price')}
                </div>
              </th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">SKU</th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Código de Barras</th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Estado</th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={tableStyles.emptyState}>
                  <div style={tableStyles.emptyStateIcon}>📦</div>
                  <div style={tableStyles.emptyStateTitle}>No hay productos</div>
                  <div style={tableStyles.emptyStateDescription}>
                    {searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Comienza creando tu primer producto.'}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product, index) => (
                <tr
                  key={product.id}
                  style={getRowStyle(index, hoveredRow === product.id, theme)}
                  onMouseEnter={() => setHoveredRow(product.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Columna de imagen */}
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: theme.backgroundTertiary,
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderColor}`,
                    }}>
                      <img
                        src={product.imagePath ? getImageUrl(product.imagePath) : '/images/image-default.png'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          opacity: 1,
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onError={(e) => {
                          // Si falla la imagen por defecto, usar un placeholder
                          e.currentTarget.src = '/images/image-default.png';
                        }}
                      />
                    </div>
                  </td>
                  
                  {/* Columna de nombre */}
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/dashboard/products/${product.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: theme.textPrimary }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.textSecondary, marginTop: '2px' }}>
                          {product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={getStatusBadgeStyle('active', theme)}>
                      {product.category}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    {product.subcategory ? (
                      <span style={{
                        ...getStatusBadgeStyle('active', theme),
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        color: theme.primaryColor,
                        border: `1px solid ${theme.primaryColor}30`,
                      }}>
                        {product.subcategory}
                      </span>
                    ) : (
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        -
                      </span>
                    )}
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={{ fontWeight: '600', color: theme.success }}>
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <code style={{
                      backgroundColor: theme.backgroundSecondary,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      color: theme.textSecondary,
                    }}>
                      {product.sku}
                    </code>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    {product.barcode ? (
                      <code style={{
                        backgroundColor: theme.backgroundSecondary,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: theme.textPrimary,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        display: 'block',
                        maxWidth: '200px',
                      }}>
                        {product.barcode}
                      </code>
                    ) : (
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        Sin código
                      </span>
                    )}
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={getStatusBadgeStyle('active', theme)}>
                      Activo
                    </span>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    {product.barcode ? (
                      <button
                        onClick={() => {
                          if (!product.barcode) return;
                          
                          // Crear un contenedor temporal oculto para renderizar el código de barras
                          const tempContainer = document.createElement('div');
                          tempContainer.style.position = 'absolute';
                          tempContainer.style.left = '-9999px';
                          tempContainer.style.top = '-9999px';
                          document.body.appendChild(tempContainer);
                          
                          // Crear un div para el código de barras
                          const barcodeDiv = document.createElement('div');
                          barcodeDiv.id = `temp-barcode-${product.id}`;
                          tempContainer.appendChild(barcodeDiv);
                          
                          // Renderizar el código de barras usando React
                          const root = createRoot(barcodeDiv);
                          root.render(
                            React.createElement(Barcode, {
                              value: product.barcode,
                              format: 'CODE128',
                              width: 1,
                              height: 60,
                              displayValue: false,
                              fontSize: 14,
                              margin: 5,
                            })
                          );
                          
                          // Esperar a que React renderice el código de barras
                          setTimeout(() => {
                            const barcodeSVG = barcodeDiv.querySelector('svg');
                            const barcodeHTML = barcodeSVG ? barcodeSVG.outerHTML : '';
                            
                            // Limpiar el contenedor temporal
                            root.unmount();
                            document.body.removeChild(tempContainer);
                            
                            // Crear ventana de impresión
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Código de Barras - ${product.name}</title>
                                    <style>
                                      @media print {
                                        body { margin: 0; padding: 20px; }
                                        @page { margin: 0; size: auto; }
                                      }
                                      body {
                                        font-family: Arial, sans-serif;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        justify-content: center;
                                        min-height: 100vh;
                                        margin: 0;
                                        padding: 20px;
                                      }
                                      .barcode-container {
                                        background: white;
                                        padding: 24px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        gap: 16px;
                                        min-width: 300px;
                                      }
                                      .barcode-svg {
                                        width: auto;
                                        height: 60px;
                                        max-width: 100%;
                                      }
                                      .barcode-number {
                                        font-size: 1.2rem;
                                        font-family: monospace;
                                        letter-spacing: 2px;
                                        color: #333;
                                        font-weight: 600;
                                      }
                                      .product-name {
                                        font-size: 1.3rem;
                                        font-weight: 700;
                                        color: #000;
                                        text-align: center;
                                        margin-top: 8px;
                                      }
                                      .product-price {
                                        font-size: 1.1rem;
                                        font-weight: 600;
                                        color: #059669;
                                        margin-top: 4px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="barcode-container">
                                      <div class="barcode-svg">${barcodeHTML}</div>
                                      <div class="barcode-number">${product.barcode}</div>
                                      <div class="product-name">${product.name}</div>
                                      <div class="product-price">$${product.price.toFixed(2)}</div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              setTimeout(() => {
                                printWindow.print();
                              }, 250);
                            }
                          }, 200);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: theme.primaryColor,
                          color: theme.white,
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#7c3aed';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.primaryColor;
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <FaPrint />
                        Imprimir
                      </button>
                    ) : (
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        Sin código
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con búsqueda y paginación */}
        <div style={tableStyles.tableFooter} className="table-footer-responsive">
          <div style={tableStyles.searchContainer} className="search-container-responsive">
            <FaSearch style={{ color: theme.textSecondary }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...tableStyles.searchInput,
                ...(searchQuery ? tableStyles.searchInputFocus : {})
              }}
              className="search-input-responsive"
            />
          </div>
          
          <div style={tableStyles.paginationContainer} className="pagination-container-responsive">
            <span style={tableStyles.paginationInfo}>
              Rows per page:
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={tableStyles.rowsPerPageSelect}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            
            <span style={tableStyles.paginationInfo}>
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
            </span>
            
            <button
              style={{
                ...tableStyles.paginationButton,
                ...(currentPage === 1 ? tableStyles.paginationButtonDisabled : {})
              }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            
            <button
              style={{
                ...tableStyles.paginationButton,
                ...(currentPage === totalPages ? tableStyles.paginationButtonDisabled : {})
              }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {isCreating && (
        <ModalComponent
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Crear Producto"
        >
          {error && <p className="text-danger">{error}</p>}
          <ProductForm onSubmit={handleCreateProduct} />
        </ModalComponent>
      )}

    </div>
  );
};

export default ProductsPage;
