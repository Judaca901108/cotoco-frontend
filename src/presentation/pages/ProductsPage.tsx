import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaBox, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import ProductForm from '../components/ProductForm';
import { tableStyles, getRowStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';
import colors from '../../shared/colors';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
  imagePath?: string; // URL de la imagen
};

const BASE_PATH = "http://localhost:3000"
const categories = ['Minifigura', 'Sets', 'Bases', 'Model Kits'];

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    fetch(`${BASE_PATH}/product`) // Ajusta la URL según tu backend
      .then((res) => res.json())
      .then((data) => {
        const parsedProducts = data.map((product: any) => ({
          ...product,
          price: parseFloat(product.price), // Convertimos `price` a número
        }));
        setProducts(parsedProducts);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);


  const handleCreateProduct = async (data: { name: string; description: string; price: number; sku: string; category: string; image?: File }) => {
    try {
      console.log('Datos recibidos:', data);
      
      // Si hay imagen, usar FormData, si no, usar JSON
      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('sku', data.sku);
        formData.append('category', data.category);
        formData.append('image', data.image);
        
        console.log('Enviando con FormData (con imagen)');
        console.log('Imagen:', data.image.name, data.image.size, 'bytes');
        
        const res = await fetch(`${BASE_PATH}/product`, {
          method: 'POST',
          body: formData,
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
      } else {
        // Sin imagen, enviar como JSON
        const jsonData = {
          name: data.name,
          description: data.description,
          price: data.price,
          sku: data.sku,
          category: data.category,
        };
        
        console.log('Enviando como JSON (sin imagen):', jsonData);
        
        const res = await fetch(`${BASE_PATH}/product`, {
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
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div style={tableStyles.pageContainer}>
      {/* Header de la página */}
      <div style={tableStyles.pageHeader}>
        <h1 style={tableStyles.pageTitle}>Productos</h1>
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
      <div style={tableStyles.tableContainer}>
        {/* Tabla */}
        <table style={tableStyles.table}>
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th style={tableStyles.tableHeaderCell}>Imagen</th>
              <th style={tableStyles.tableHeaderCell}>Nombre</th>
              <th style={tableStyles.tableHeaderCell}>Categoría</th>
              <th style={tableStyles.tableHeaderCell}>Precio</th>
              <th style={tableStyles.tableHeaderCell}>SKU</th>
              <th style={tableStyles.tableHeaderCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={tableStyles.emptyState}>
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
                  style={getRowStyle(index, hoveredRow === product.id)}
                  onMouseEnter={() => setHoveredRow(product.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Columna de imagen */}
                  <td style={tableStyles.tableCell}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: '6px',
                      border: `1px solid ${colors.borderColor}`,
                    }}>
                      {product.imagePath ? (
                        <img
                          src={`http://localhost:3000/product/image/${product.imagePath}`}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            opacity: 1, // Asegurar opacidad normal
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onError={(e) => {
                            // Si la imagen falla al cargar, ocultar y mostrar icono
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: ${colors.textSecondary}; font-size: 1.2rem;">📦</div>`;
                            }
                          }}
                        />
                      ) : (
                        <FaBox style={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
                      )}
                    </div>
                  </td>
                  
                  {/* Columna de nombre */}
                  <td style={tableStyles.tableCell}>
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
                        <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '2px' }}>
                          {product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle('active')}>
                      {product.category}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={{ fontWeight: '600', color: colors.success }}>
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <code style={{
                      backgroundColor: colors.backgroundSecondary,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      color: colors.textSecondary,
                    }}>
                      {product.sku}
                    </code>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle('active')}>
                      Activo
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con búsqueda y paginación */}
        <div style={tableStyles.tableFooter}>
          <div style={tableStyles.searchContainer}>
            <FaSearch style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...tableStyles.searchInput,
                ...(searchQuery ? tableStyles.searchInputFocus : {})
              }}
            />
          </div>
          
          <div style={tableStyles.paginationContainer}>
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
          <ProductForm onSubmit={handleCreateProduct} categories={categories} />
        </ModalComponent>
      )}

    </div>
  );
};

export default ProductsPage;
