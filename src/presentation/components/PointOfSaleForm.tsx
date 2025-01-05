import React, { useState } from 'react';

type PointOfSaleFormProps = {
  initialData?: { name: string; address: string; location: string; type: string };
  types?: string[];
  onSubmit: (data: { name: string; address: string; location: string; type: string }) => void;
};

const PointOfSaleForm: React.FC<PointOfSaleFormProps> = ({ initialData, types = [], onSubmit }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: '',
    location: '',
    type: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria.';
    if (!formData.type.trim()) newErrors.type = 'El tipo es obligatorio.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
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
        <label htmlFor="address" className="form-label">
          Dirección
        </label>
        <input
          type="text"
          className={`form-control ${errors.address ? 'is-invalid' : ''}`}
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="location" className="form-label">
          Ubicación
        </label>
        <input
          type="text"
          className={`form-control ${errors.location ? 'is-invalid' : ''}`}
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        {errors.location && <div className="invalid-feedback">{errors.location}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="type" className="form-label">
          Tipo
        </label>
        <select
          className={`form-control ${errors.type ? 'is-invalid' : ''}`}
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="">Seleccione una categoría</option>
          {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
          ))}
        </select>
        {errors.type && <div className="invalid-feedback">{errors.type}</div>}
      </div>
      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
};

export default PointOfSaleForm;
