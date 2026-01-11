import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaStore, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import PointOfSaleForm from '../components/PointOfSaleForm';
import { authenticatedFetch } from '../../infrastructure/authService';
import { tableStyles, getRowStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';
import colors from '../../shared/colors';
import { API_BASE_URL } from '../../config/apiConfig';

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

const BASE_PATH = API_BASE_URL;
const type = ['Bodega', 'Puntos Fijos', 'Ferias'];

const PointOfSalePage: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('order', order);
    }
    const url = `${BASE_PATH}/point-of-sale${params.toString() ? `?${params.toString()}` : ''}`;
    
    authenticatedFetch(url)
      .then((res) => res.json())
      .then((data) => setPointsOfSale(data))
      .catch((err) => {
        console.error('Error fetching points of sale:', err);
        setPointsOfSale([]); // Asegurarse de inicializar como un arreglo vacío en caso de error
      });
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
      ? <FaSortUp style={{ marginLeft: '4px', color: colors.primaryColor }} />
      : <FaSortDown style={{ marginLeft: '4px', color: colors.primaryColor }} />;
  };

  const handleCreatePointOfSale = async (data: { name: string; address: string; location: string; type: string }) => {
    try {
      const res = await authenticatedFetch(`${BASE_PATH}/point-of-sale`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al crear el punto de venta');
      const newPointOfSale = await res.json();
      setPointsOfSale((prev) => [...prev, newPointOfSale]);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };


  const filteredPointsOfSales = Array.isArray(pointsOfSale)
    ? pointsOfSale.filter((pointOfSale) =>
        pointOfSale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pointOfSale.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pointOfSale.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pointOfSale.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Paginación
  const totalPages = Math.ceil(filteredPointsOfSales.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPointsOfSales = filteredPointsOfSales.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={tableStyles.pageContainer} className="page-container-responsive">
      {/* Header de la página */}
      <div style={tableStyles.pageHeader} className="page-header-responsive">
        <h1 style={tableStyles.pageTitle} className="page-title-responsive">Puntos de Venta</h1>
        <button
          style={tableStyles.createButton}
          className="create-button-responsive"
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
          Crear Punto de Venta
        </button>
      </div>

      {/* Contenedor de la tabla */}
      <div style={tableStyles.tableContainer} className="table-container-responsive table-responsive">
        {/* Tabla */}
        <table style={tableStyles.table} className="table-responsive">
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('name')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
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
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Dirección</th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Ubicación</th>
              <th 
                style={{ ...tableStyles.tableHeaderCell, cursor: 'pointer', userSelect: 'none' }} 
                className="table-header-cell-responsive"
                onClick={() => handleSort('type')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Tipo
                  {getSortIcon('type')}
                </div>
              </th>
              <th style={tableStyles.tableHeaderCell} className="table-header-cell-responsive">Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPointsOfSales.length === 0 ? (
              <tr>
                <td colSpan={6} style={tableStyles.emptyState}>
                  <div style={tableStyles.emptyStateIcon}>🏪</div>
                  <div style={tableStyles.emptyStateTitle}>No hay puntos de venta</div>
                  <div style={tableStyles.emptyStateDescription}>
                    {searchQuery ? 'No se encontraron puntos de venta que coincidan con tu búsqueda.' : 'Comienza creando tu primer punto de venta.'}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPointsOfSales.map((pointOfSale, index) => (
                <tr
                  key={pointOfSale.id}
                  style={getRowStyle(index, hoveredRow === pointOfSale.id)}
                  onMouseEnter={() => setHoveredRow(pointOfSale.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/dashboard/point-of-sales/${pointOfSale.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <div style={getTechIconStyle('go')}>
                        <FaStore />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                          {pointOfSale.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '2px' }}>
                          ID: {pointOfSale.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMapMarkerAlt style={{ color: colors.textSecondary, fontSize: '0.8rem' }} />
                      <span style={{ fontSize: '0.9rem' }}>
                        {pointOfSale.address.length > 30 ? `${pointOfSale.address.substring(0, 30)}...` : pointOfSale.address}
                      </span>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={{ color: colors.textSecondary }}>
                      {pointOfSale.location}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
                    <span style={getStatusBadgeStyle('active')}>
                      {pointOfSale.type}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell} className="table-cell-responsive">
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
          <div style={tableStyles.searchContainer} className="search-container-responsive">
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
              className="search-input-responsive"
            />
          </div>
          
          <div style={tableStyles.paginationContainer} className="table-footer-responsive pagination-container-responsive">
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
              {startIndex + 1}-{Math.min(endIndex, filteredPointsOfSales.length)} of {filteredPointsOfSales.length}
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
          title="Crear Punto de Venta"
        >
          {error && <p className="text-danger">{error}</p>}
          <PointOfSaleForm onSubmit={handleCreatePointOfSale} types={type} />
        </ModalComponent>
      )}

    </div>
  );
};

export default PointOfSalePage;
