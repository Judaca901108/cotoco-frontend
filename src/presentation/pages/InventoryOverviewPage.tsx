import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type PointOfSaleSummary = {
  id: number;
  name: string;
  productCount: number;
};

const InventoryOverviewPage: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSaleSummary[]>([]);
  const [error, setError] = useState('');
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

  return (
    <div style={{ padding: '20px', backgroundColor: colors.mainBackground }}>
      <h2>Puntos de Venta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {pointsOfSale.map((pos) => (
          <div
            key={pos.id}
            style={{
              backgroundColor: colors.sidebarBackground,
              color: colors.sidebarActiveText,
              padding: '20px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/dashboard/point-of-sales/inventory/${pos.id}`)}
          >
            <h3>{pos.name}</h3>
            <p>Productos: {pos.productCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryOverviewPage;
