import React, { useState } from 'react';
import { FaSave, FaTimes, FaBox, FaWarehouse } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';

type InventoryFormProps = {
  initialData?: { productId: number; stockQuantity: number; minimumStock: number };
  products: { id: number; name: string }[]; // Lista de productos disponibles
  onSubmit: (data: { productId: number; stockQuantity: number; minimumStock: number }) => void;
  onCancel?: () => void;
  title?: string;
};
  

const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  products,
  onSubmit,
  onCancel,
  title = "Gestión de Inventario"
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      productId: 0,
      stockQuantity: 0,
      minimumStock: 0,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.productId) newErrors.productId = 'El producto es obligatorio.';
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'La cantidad no puede ser negativa.';
    if (formData.minimumStock < 0) newErrors.minimumStock = 'El stock mínimo no puede ser negativo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'stockQuantity' || name === 'minimumStock' ? Number(value) : value }));
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
        {/* Producto */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="productId" style={formStyles.label}>
            <FaBox style={{ marginRight: '8px' }} />
            Producto *
          </label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            onFocus={() => handleFocus('productId')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.productId, focusedField === 'productId')}
          >
            <option value={0}>Seleccione un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId && (
            <div style={formStyles.errorMessage}>
              <span>{errors.productId}</span>
            </div>
          )}
        </div>

        {/* Cantidad en Inventario y Stock Mínimo en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="stockQuantity" style={formStyles.label}>
              <FaWarehouse style={{ marginRight: '8px' }} />
              Cantidad en Inventario *
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              onFocus={() => handleFocus('stockQuantity')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.stockQuantity, focusedField === 'stockQuantity')}
              placeholder="0"
              min="0"
            />
            {errors.stockQuantity && (
              <div style={formStyles.errorMessage}>
                <span>{errors.stockQuantity}</span>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="minimumStock" style={formStyles.label}>
              Stock Mínimo *
            </label>
            <input
              type="number"
              id="minimumStock"
              name="minimumStock"
              value={formData.minimumStock}
              onChange={handleChange}
              onFocus={() => handleFocus('minimumStock')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.minimumStock, focusedField === 'minimumStock')}
              placeholder="0"
              min="0"
            />
            {errors.minimumStock && (
              <div style={formStyles.errorMessage}>
                <span>{errors.minimumStock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
            Información del Inventario
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: formStyles.errorMessage.color,
            margin: 0,
          }}>
            • La cantidad en inventario representa el stock actual disponible<br/>
            • El stock mínimo es el nivel por debajo del cual se debe reabastecer
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
            Guardar Inventario
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
