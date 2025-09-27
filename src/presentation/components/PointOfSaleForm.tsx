import React, { useState } from 'react';
import { FaSave, FaTimes, FaStore, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';

type PointOfSaleFormProps = {
  initialData?: { name: string; address: string; location: string; type: string };
  types?: string[];
  onSubmit: (data: { name: string; address: string; location: string; type: string }) => void;
  onCancel?: () => void;
  title?: string;
};

const PointOfSaleForm: React.FC<PointOfSaleFormProps> = ({ 
  initialData, 
  types = [], 
  onSubmit, 
  onCancel,
  title = "Gestión de Punto de Venta"
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: '',
    location: '',
    type: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>{title}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Nombre del punto de venta */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="name" style={formStyles.label}>
            <FaStore style={{ marginRight: '8px' }} />
            Nombre del Punto de Venta *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
            style={getInputStyles(!!errors.name, focusedField === 'name')}
            placeholder="Ej: Tienda Centro, Sucursal Norte..."
          />
          {errors.name && (
            <div style={formStyles.errorMessage}>
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Dirección y Ubicación en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="address" style={formStyles.label}>
              <FaMapMarkerAlt style={{ marginRight: '8px' }} />
              Dirección *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onFocus={() => handleFocus('address')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.address, focusedField === 'address')}
              placeholder="Calle 123 #45-67"
            />
            {errors.address && (
              <div style={formStyles.errorMessage}>
                <span>{errors.address}</span>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="location" style={formStyles.label}>
              Ubicación *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onFocus={() => handleFocus('location')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.location, focusedField === 'location')}
              placeholder="Ciudad, Departamento"
            />
            {errors.location && (
              <div style={formStyles.errorMessage}>
                <span>{errors.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tipo de punto de venta */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="type" style={formStyles.label}>
            <FaBuilding style={{ marginRight: '8px' }} />
            Tipo de Punto de Venta *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            onFocus={() => handleFocus('type')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.type, focusedField === 'type')}
          >
            <option value="">Seleccione el tipo de punto de venta</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && (
            <div style={formStyles.errorMessage}>
              <span>{errors.type}</span>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div style={{
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: `1px solid ${formStyles.input.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: formStyles.label.color,
            margin: '0 0 8px 0',
          }}>
            Información del Punto de Venta
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: formStyles.errorMessage.color,
            margin: 0,
          }}>
            • El nombre debe ser único y descriptivo<br/>
            • La dirección debe incluir calle, número y barrio<br/>
            • La ubicación debe especificar ciudad y departamento
          </p>
        </div>

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={formStyles.secondaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaTimes />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            style={formStyles.primaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaSave />
            Guardar Punto de Venta
          </button>
        </div>
      </form>
    </div>
  );
};

export default PointOfSaleForm;
