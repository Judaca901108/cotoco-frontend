import React, { useState, useEffect } from 'react';

type ProductFormProps = {
  initialData?: { name: string; description: string; price: number | string; sku: string; category: string };
  categories?: string[]; // Lista de categorías opcional
  onSubmit: (data: { name: string; description: string; price: number; sku: string; category: string }) => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories = [], onSubmit }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '', // Campo para la categoría
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!formData.price || parseFloat(String(formData.price)) <= 0) newErrors.price = 'El precio debe ser mayor a 0.';
    if (!formData.sku.trim()) newErrors.sku = 'El SKU es obligatorio.';
    if (!formData.category) newErrors.category = 'La categoría es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        ...formData,
        price: parseFloat(String(formData.price)), // Convertimos price a número
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nombre
        </label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="category" className="form-label">
          Categoría
        </label>
        <select
          className={`form-control ${errors.category ? 'is-invalid' : ''}`}
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Seleccione una categoría</option>
          {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
          ))}
        </select>
        {errors.category && <div className="invalid-feedback">{errors.category}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="price" className="form-label">
          Precio
        </label>
        <input
          type="number"
          className={`form-control ${errors.price ? 'is-invalid' : ''}`}
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="sku" className="form-label">
          SKU
        </label>
        <input
          type="text"
          className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
        />
        {errors.sku && <div className="invalid-feedback">{errors.sku}</div>}
      </div>
      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
