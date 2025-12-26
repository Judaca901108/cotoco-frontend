import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWarehouse, FaBox, FaChevronRight } from 'react-icons/fa';
import { tableStyles, getRowStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';
import colors from '../../shared/colors';

import { API_BASE_URL } from '../../config/apiConfig';
const BASE_PATH = API_BASE_URL;

type PointOfSaleSummary = {
  id: number;
  name: string;
  productCount: number;
};

const InventoryPage: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSaleSummary[]>([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_PATH}/point-of-sale/summary`)
      .then((res) => res.json())
      .then((data) => setPointsOfSale(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error fetching points of sale summary:', err);
        setError('No se pudieron cargar los puntos de venta.');
      });
  }, []);

  const filteredPointsOfSale = pointsOfSale.filter((pos) =>
    pos.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredPointsOfSale.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPointsOfSale = filteredPointsOfSale.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={tableStyles.pageContainer} className="page-container-responsive">
      {/* Header de la página */}
      <div style={tableStyles.pageHeader} className="page-header-responsive">
        <h1 style={tableStyles.pageTitle}>Inventario por Puntos de Venta</h1>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          color: colors.error,
        }}>
          {error}
        </div>
      )}

      {/* Contenedor de la tabla */}
      <div style={tableStyles.tableContainer}>
        {/* Tabla */}
        <table style={tableStyles.table}>
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th style={tableStyles.tableHeaderCell}>Punto de Venta</th>
              <th style={tableStyles.tableHeaderCell}>Productos</th>
              <th style={tableStyles.tableHeaderCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPointsOfSale.length === 0 ? (
              <tr>
                <td colSpan={4} style={tableStyles.emptyState}>
                  <div style={tableStyles.emptyStateIcon}>📦</div>
                  <div style={tableStyles.emptyStateTitle}>No hay puntos de venta</div>
                  <div style={tableStyles.emptyStateDescription}>
                    {searchQuery ? 'No se encontraron puntos de venta que coincidan con tu búsqueda.' : 'No hay puntos de venta disponibles para mostrar el inventario.'}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPointsOfSale.map((pos, index) => (
                <tr
                  key={pos.id}
                  style={getRowStyle(index, hoveredRow === pos.id)}
                  onMouseEnter={() => setHoveredRow(pos.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={tableStyles.tableCell}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/dashboard/point-of-sales/${pos.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <div style={getTechIconStyle('node')}>
                        <FaWarehouse />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                          {pos.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '2px' }}>
                          ID: {pos.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBox style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                        {pos.productCount}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                        {pos.productCount === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle(pos.productCount > 0 ? 'active' : 'inactive')}>
                      {pos.productCount > 0 ? 'Con Stock' : 'Sin Stock'}
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
              {startIndex + 1}-{Math.min(endIndex, filteredPointsOfSale.length)} of {filteredPointsOfSale.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
