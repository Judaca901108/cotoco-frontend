import React, { useState } from 'react';

type InventoryFormProps = {
  initialData?: { productId: number; stockQuantity: number; minimumStock: number };
  products: { id: number; name: string }[]; // Lista de productos disponibles
  onSubmit: (data: { productId: number; stockQuantity: number; minimumStock: number }) => void;
};
  

const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  products,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      productId: 0,
      stockQuantity: 0,
      minimumStock: 0,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.productId) newErrors.productId = 'El producto es obligatorio.'
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'La cantidad no puede ser negativa.';
    if (formData.minimumStock < 0) newErrors.minimumStock = 'El stock mínimo no puede ser negativo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'stockQuantity' || name === 'minimumStock' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="productId" className="form-label">
          Producto
        </label>
        <select
          className={`form-control ${errors.productId ? 'is-invalid' : ''}`}
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
        >
          <option value={0}>Seleccione un producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="stockQuantity" className="form-label">
          Cantidad en Inventario
        </label>
        <input
          type="number"
          className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
          id="stockQuantity"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={handleChange}
        />
        {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="minimumStock" className="form-label">
          Stock Mínimo
        </label>
        <input
          type="number"
          className={`form-control ${errors.minimumStock ? 'is-invalid' : ''}`}
          id="minimumStock"
          name="minimumStock"
          value={formData.minimumStock}
          onChange={handleChange}
        />
        {errors.minimumStock && <div className="invalid-feedback">{errors.minimumStock}</div>}
      </div>

      <button type="submit" className="btn btn-primary">
        Guardar
      </button>
    </form>
  );
};

export default InventoryForm;
