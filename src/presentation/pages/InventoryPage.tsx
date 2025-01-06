import React, { useState, useEffect } from 'react';
import InventoryForm from '../components/InventoryForm';
import ModalComponent from '../components/ModalComponent';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type Inventory = {
  id: number;
  stockQuantity: number;
  minimumStock: number;
  product: Product;
  pointOfSale: PointOfSale;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
};

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BASE_PATH}/inventory`)
      .then((res) => res.json())
      .then((data) => { setInventories(Array.isArray(data) ? data : [])})
      .catch((err) => console.error('Error fetching inventories:', err));

    fetch(`${BASE_PATH}/product`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));

    fetch(`${BASE_PATH}/point-of-sale`)
      .then((res) => res.json())
      .then((data) => setPointsOfSale(data))
      .catch((err) => console.error('Error fetching points of sale:', err));
  }, []);

  const findProductById = (productId: number): Product => {
    const defaultProduct: Product = {
      id: -1,
      name: "Unknown Product",
      price: 0, 
      description: "",
      sku: "",
      category: ""
    };
  
    return products.find(({ id }) => id === productId) ?? defaultProduct;
  };

  const findPointOfSaleById = (pointOfSaleId: number): PointOfSale => {
    const defaultPointOfSale: PointOfSale = {
      id: -1,
      name: "Unknown Product", 
      address: "",
      location: "",
      type: ""
    };
  
    return pointsOfSale.find(({ id }) => id === pointOfSaleId) ?? defaultPointOfSale;
  };

  const handleCreateInventory = async (data: { productId: number; pointOfSaleId: number; stockQuantity: number; minimumStock: number }) => {
    try {
      const res = await fetch(`${BASE_PATH}/inventory`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al crear el inventario');
      const newInventory = await res.json();
      newInventory.product = findProductById(newInventory.productId);
      newInventory.pointOfSale = findPointOfSaleById(newInventory.pointOfSaleId)
      setInventories((prev) => [...prev, newInventory]);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.mainBackground }}>
      <h2>Inventarios</h2>
      <button onClick={() => setIsCreating(true)} className="btn btn-primary mb-3">
        Crear Inventario
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Punto de Venta</th>
            <th>Cantidad</th>
            <th>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((inventory) => (
            <tr key={inventory.id}>
              <td>{inventory.product.name}</td>
              <td>{inventory.pointOfSale.name}</td>
              <td>{inventory.stockQuantity}</td>
              <td>{inventory.minimumStock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreating && (
        <ModalComponent
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Crear Inventario"
        >
          <InventoryForm
            onSubmit={handleCreateInventory}
            products={products}
            pointsOfSale={pointsOfSale}
          />
        </ModalComponent>
      )}
    </div>
  );
};

export default InventoryPage;
