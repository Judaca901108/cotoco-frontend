import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaStore, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import PointOfSaleForm from '../components/PointOfSaleForm';
import { tableStyles, getRowStyle, getActionButtonStyle, getStatusBadgeStyle, getTechIconStyle } from '../../shared/tableStyles';
import colors from '../../shared/colors';

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

const BASE_PATH = "http://localhost:3000"
const type = ['Bodega', 'Puntos Fijos', 'Ferias'];

const PointOfSalePage: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<{ id: number | null }>({ id: null });
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/point-of-sale`)
      .then((res) => res.json())
      .then((data) => setPointsOfSale(data))
      .catch((err) => {
        console.error('Error fetching points of sale:', err);
        setPointsOfSale([]); // Asegurarse de inicializar como un arreglo vacío en caso de error
      });
  }, []);

  const handleDelete = (id: number) => {
    fetch(`${BASE_PATH}/point-of-sale/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          setPointsOfSale(pointsOfSale.filter((pointOfSale) => pointOfSale.id !== id));
          alert('Punto de Venta eliminado correctamente');
        } else {
          alert('Error al eliminar el Punto de Venta');
        }
      });
  };

  const handleCreatePointOfSale = async (data: { name: string; address: string; location: string; type: string }) => {
    try {
      const res = await fetch(`${BASE_PATH}/point-of-sale`, {
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

  const handleEditPointOfSale = async (data: { name: string; address: string; location: string; type: string }) => {
    try {
      const res = await fetch(`${BASE_PATH}/point-of-sale/${isEditing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al modificar el punto de venta');
      const updatedPointOfSale = await res.json();
      setPointsOfSale((prev) => prev.map((p) => (p.id === isEditing.id ? updatedPointOfSale : p)));
      setIsEditing({ id: null });
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
    <div style={tableStyles.pageContainer}>
      {/* Header de la página */}
      <div style={tableStyles.pageHeader}>
        <h1 style={tableStyles.pageTitle}>Puntos de Venta</h1>
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
          Crear Punto de Venta
        </button>
      </div>

      {/* Contenedor de la tabla */}
      <div style={tableStyles.tableContainer}>
        {/* Tabla */}
        <table style={tableStyles.table}>
          <thead style={tableStyles.tableHeader}>
            <tr>
              <th style={tableStyles.tableHeaderCell}>Nombre</th>
              <th style={tableStyles.tableHeaderCell}>Dirección</th>
              <th style={tableStyles.tableHeaderCell}>Ubicación</th>
              <th style={tableStyles.tableHeaderCell}>Tipo</th>
              <th style={tableStyles.tableHeaderCell}>Estado</th>
              <th style={{...tableStyles.tableHeaderCell, textAlign: 'center'}}>Acciones</th>
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
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMapMarkerAlt style={{ color: colors.textSecondary, fontSize: '0.8rem' }} />
                      <span style={{ fontSize: '0.9rem' }}>
                        {pointOfSale.address.length > 30 ? `${pointOfSale.address.substring(0, 30)}...` : pointOfSale.address}
                      </span>
                    </div>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={{ color: colors.textSecondary }}>
                      {pointOfSale.location}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle('active')}>
                      {pointOfSale.type}
                    </span>
                  </td>
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle('active')}>
                      Activo
                    </span>
                  </td>
                  <td style={{...tableStyles.tableCell, textAlign: 'center'}}>
                    <button
                      style={getActionButtonStyle('edit')}
                      onClick={() => setIsEditing({ id: pointOfSale.id })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      style={getActionButtonStyle('delete')}
                      onClick={() => handleDelete(pointOfSale.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <FaTrash />
                    </button>
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

      {isEditing.id !== null && (
        <ModalComponent
          isOpen={!!isEditing.id}
          onClose={() => setIsEditing({ id: null })}
          title="Editar Punto de Venta"
        >
          {error && <p className="text-danger">{error}</p>}
          <PointOfSaleForm
            initialData={pointsOfSale.find((p) => p.id === isEditing.id)!}
            onSubmit={handleEditPointOfSale}
            types={type}
          />
        </ModalComponent>
      )}
    </div>
  );
};

export default PointOfSalePage;
