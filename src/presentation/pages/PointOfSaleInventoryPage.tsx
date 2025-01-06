import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type Inventory = {
  id: number;
  productId: string;
  productName: string;
  stockQuantity: number;
  minimumStock: number;
};

const PointOfSaleInventoryPage: React.FC = () => {
  const { pointOfSaleId } = useParams<{ pointOfSaleId: string }>();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [pointOfSaleName, setPointOfSaleName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!pointOfSaleId) return;

    fetch(`${BASE_PATH}/point-of-sale/${pointOfSaleId}/inventories`)
      .then((res) => res.json())
      .then((data) => {
        setInventories(data); // Asigna directamente el arreglo de inventarios
      })
      .catch((err) => {
        console.error('Error fetching point of sale inventories:', err);
        setError('No se pudieron cargar los inventarios.');
      });
  }, [pointOfSaleId]);

  const filteredInventories = inventories.filter((inventory) =>
    inventory.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <div style={{ padding: '20px', backgroundColor: colors.mainBackground }}>
      <button onClick={() => navigate('/dashboard/point-of-sales/sumary')} className="btn btn-secondary mb-3">
        Volver
      </button>
      <h2>{pointOfSaleName}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre del producto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '300px',
          }}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventories.map((inventory) => (
            <tr key={inventory.id}>
              <td>{inventory.productName}</td>
              <td>{inventory.stockQuantity}</td>
              <td
                style={{
                  color: inventory.stockQuantity < inventory.minimumStock ? 'red' : 'inherit',
                  fontWeight: inventory.stockQuantity < inventory.minimumStock ? 'bold' : 'normal',
                }}
              >
                {inventory.minimumStock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PointOfSaleInventoryPage;
