import React, { useState, useEffect } from 'react';
import ModalComponent from '../components/ModalComponent';
import PointOfSaleForm from '../components/PointOfSaleForm';
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
      pointOfSale.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : [];

  return (
    <div style={{ padding: '20px', backgroundColor: colors.mainBackground, color: colors.mainText }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="Buscar puntos de venta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: `1px solid ${colors.sidebarInactiveText}`,
            width: '300px',
          }}
        />
        <button
          style={{
            backgroundColor: colors.sidebarActiveBackground,
            color: colors.sidebarActiveText,
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => setIsCreating(true)}
        >
          Crear Punto de Venta
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Dirección</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Ubicación</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Tipo</th>
            <th style={{ textAlign: 'center', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPointsOfSales.map((pointsOfSales) => (
            <tr key={pointsOfSales.id}>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{pointsOfSales.name}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{pointsOfSales.address}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{pointsOfSales.location}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{pointsOfSales.type}</td>
              <td style={{ textAlign: 'center', padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>
                <button
                  style={{
                    backgroundColor: colors.sidebarInactiveText,
                    color: colors.sidebarActiveText,
                    padding: '5px 10px',
                    borderRadius: '5px',
                    marginRight: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsEditing({ id: pointsOfSales.id })}
                >
                  Modificar
                </button>
                <button
                  style={{
                    backgroundColor: colors.sidebarActiveBackground,
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleDelete(pointsOfSales.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
