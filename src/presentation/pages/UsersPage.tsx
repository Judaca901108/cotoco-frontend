import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaUser, FaPhone, FaIdCard, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ModalComponent from '../components/ModalComponent';
import UserForm from '../components/UserForm';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
import { tableStyles, getRowStyle, getStatusBadgeStyle } from '../../shared/tableStyles';
import colors from '../../shared/colors';

const BASE_PATH = "http://localhost:3000";

type User = {
  id: number;
  username: string;
  name: string;
  celular: string;
  documentoIdentidad: string;
  isActive: boolean;
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      const res = await authenticatedFetch(`${BASE_PATH}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (data: { 
    username: string; 
    password: string; 
    name: string; 
    celular: string; 
    documentoIdentidad: string;
    role: string;
  }) => {
    try {
      console.log('Datos recibidos:', data);
      
      const res = await authenticatedFetch(`${BASE_PATH}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      // Recargar la lista de usuarios para obtener los datos actualizados
      await loadUsers();
      setIsCreating(false);
      setError('');
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Excluir el usuario actualmente logueado
    if (currentUser && user.id === currentUser.id) {
      return false;
    }
    
    // Aplicar filtro de búsqueda
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.celular.includes(searchQuery) ||
           user.documentoIdentidad.includes(searchQuery);
  });

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={tableStyles.pageContainer}>
      {/* Header de la página */}
      <div style={tableStyles.pageHeader}>
        <h1 style={tableStyles.pageTitle}>Gestión de Usuarios</h1>
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
          Crear Usuario
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div style={tableStyles.searchContainer}>
        <FaSearch style={{ color: colors.textSecondary, fontSize: '1rem' }} />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre, username, celular o documento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={tableStyles.searchInput}
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: colors.error,
          fontSize: '0.9rem',
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
              <th style={tableStyles.tableHeaderCell}>Usuario</th>
              <th style={tableStyles.tableHeaderCell}>Nombre</th>
              <th style={tableStyles.tableHeaderCell}>Celular</th>
              <th style={tableStyles.tableHeaderCell}>Documento</th>
              <th style={tableStyles.tableHeaderCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={tableStyles.emptyState}>
                  <div style={tableStyles.emptyStateIcon}>👥</div>
                  <div style={tableStyles.emptyStateTitle}>No hay otros usuarios</div>
                  <div style={tableStyles.emptyStateDescription}>
                    {searchQuery 
                      ? 'No se encontraron usuarios que coincidan con tu búsqueda.' 
                      : 'No hay otros usuarios en el sistema. Crea un nuevo usuario para comenzar.'
                    }
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={getRowStyle(index, hoveredRow === user.id)}
                  onMouseEnter={() => setHoveredRow(user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Columna de usuario */}
                  <td style={tableStyles.tableCell}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/dashboard/users/${user.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: colors.primaryColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.white,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                          @{user.username}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '2px' }}>
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Columna de nombre */}
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaUser style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ fontWeight: '500', color: colors.textPrimary }}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Columna de celular */}
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ color: colors.textPrimary }}>
                        {user.celular}
                      </span>
                    </div>
                  </td>
                  
                  {/* Columna de documento */}
                  <td style={tableStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaIdCard style={{ color: colors.textSecondary, fontSize: '0.9rem' }} />
                      <span style={{ color: colors.textPrimary }}>
                        {user.documentoIdentidad}
                      </span>
                    </div>
                  </td>
                  
                  {/* Columna de estado */}
                  <td style={tableStyles.tableCell}>
                    <span style={getStatusBadgeStyle(user.isActive ? 'active' : 'inactive')}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={tableStyles.paginationContainer}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={tableStyles.paginationButton}
          >
            <FaChevronLeft />
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              style={{
                ...tableStyles.paginationButton,
                ...(currentPage === i + 1 ? tableStyles.paginationButtonActive : {}),
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={tableStyles.paginationButton}
          >
            Siguiente
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Modal para crear usuario */}
      {isCreating && (
        <ModalComponent
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Crear Nuevo Usuario"
        >
          <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreating(false)} />
        </ModalComponent>
      )}
    </div>
  );
};

export default UsersPage;
