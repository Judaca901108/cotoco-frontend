import React, { useState, useEffect } from 'react';
import ModalComponent from '../components/ModalComponent';
import ProductForm from '../components/ProductForm';
import colors from '../../shared/colors';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Aseguramos que `price` sea un número
  sku: string;
  category: string;
};

const BASE_PATH = "http://localhost:3000"
const categories = ['Piece', 'Box'];

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<{ id: number | null }>({ id: null });
  const [error, setError] = useState('');

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

  const handleDelete = (id: number) => {
    fetch(`${BASE_PATH}/product/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          setProducts(products.filter((product) => product.id !== id));
          alert('Producto eliminado correctamente');
        } else {
          alert('Error al eliminar el producto');
        }
      });
  };

  const handleCreateProduct = async (data: { name: string; description: string; price: number; sku: string }) => {
    try {
      const res = await fetch(`${BASE_PATH}/product`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Error al crear el producto');
      }
      const newProduct = await res.json();
      newProduct.price = parseFloat(newProduct.price);
      setProducts((prev) => [...prev, newProduct]);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleEditProduct = async (data: { name: string; description: string; price: number; sku: string }) => {
    try {
      const res = await fetch(`${BASE_PATH}/product/${isEditing.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Error al modificar el producto');
      }
      const updatedProduct = await res.json();
      updatedProduct.price = parseFloat(updatedProduct.price);
      setProducts((prev) => prev.map((p) => (p.id === isEditing.id ? updatedProduct : p)));
      setIsEditing({ id: null });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', backgroundColor: colors.mainBackground, color: colors.mainText }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="Buscar productos..."
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
          Crear Producto
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Descripción</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Precio</th>
            <th style={{ textAlign: 'left', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>SKU</th>
            <th style={{ textAlign: 'center', padding: '10px', backgroundColor: colors.sidebarBackground, color: colors.sidebarInactiveText }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{product.name}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{product.description}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>${product.price.toFixed(2)}</td>
              <td style={{ padding: '10px', borderBottom: `1px solid ${colors.mainText}` }}>{product.sku}</td>
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
                  onClick={() => setIsEditing({ id: product.id })}
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
                  onClick={() => handleDelete(product.id)}
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
          title="Crear Producto"
        >
          {error && <p className="text-danger">{error}</p>}
          <ProductForm onSubmit={handleCreateProduct} categories={categories} />
        </ModalComponent>
      )}

      {isEditing.id !== null && (
        <ModalComponent
          isOpen={!!isEditing.id}
          onClose={() => setIsEditing({ id: null })}
          title="Editar Producto"
        >
          {error && <p className="text-danger">{error}</p>}
          <ProductForm
            initialData={products.find((p) => p.id === isEditing.id)!}
            onSubmit={handleEditProduct}
            categories={categories}
          />
        </ModalComponent>
      )}  
    </div>
  );
};

export default ProductsPage;
