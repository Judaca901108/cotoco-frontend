import React, { useState } from 'react';
import { FaSave, FaTimes, FaImage, FaUpload } from 'react-icons/fa';
import { formStyles, getInputStyles, getTextareaStyles, getSelectStyles } from '../../shared/formStyles';
import colors from '../../shared/colors';

type ProductFormProps = {
  initialData?: { name: string; description: string; price: number | string; sku: string; category: string; imagePath?: string };
  categories?: string[]; // Lista de categorías opcional
  onSubmit: (data: { name: string; description: string; price: number; sku: string; category: string; image?: File }) => void;
  onCancel?: () => void;
  title?: string;
};

const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData, 
  categories = [], 
  onSubmit, 
  onCancel,
  title = "Gestión de Producto"
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '', // Campo para la categoría
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePath ? `http://localhost:3000/product/image/${initialData.imagePath}` : null);

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
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        ...formData,
        price: parseFloat(String(formData.price)), // Convertimos price a número
        image: selectedImage || undefined, // Incluir la imagen si se seleccionó una
      };
      console.log('Datos del formulario a enviar:', submissionData);
      onSubmit(submissionData);
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
        {/* Nombre y SKU en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="name" style={formStyles.label}>
              Nombre del Producto *
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
              placeholder="Ingrese el nombre del producto"
            />
            {errors.name && (
              <div style={formStyles.errorMessage}>
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="sku" style={formStyles.label}>
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              onFocus={() => handleFocus('sku')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.sku, focusedField === 'sku')}
              placeholder="Código único del producto"
            />
            {errors.sku && (
              <div style={formStyles.errorMessage}>
                <span>{errors.sku}</span>
              </div>
            )}
          </div>
        </div>

        {/* Categoría y Precio en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="category" style={formStyles.label}>
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onFocus={() => handleFocus('category')}
              onBlur={handleBlur}
              style={getSelectStyles(!!errors.category, focusedField === 'category')}
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <div style={formStyles.errorMessage}>
                <span>{errors.category}</span>
              </div>
            )}
          </div>

          {/* Campo de imagen */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="image" style={formStyles.label}>
              <FaImage style={{ marginRight: '8px' }} />
              Imagen del Producto
            </label>
            
            {/* Input de archivo oculto */}
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            
            {/* Botón para seleccionar imagen */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <button
                type="button"
                onClick={() => document.getElementById('image')?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: colors.buttonSecondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderColor}`,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.buttonSecondary;
                }}
              >
                <FaUpload />
                {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
              </button>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: colors.error,
                    color: colors.white,
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.error;
                  }}
                >
                  <FaTimes />
                  Eliminar
                </button>
              )}
            </div>
            
            {/* Preview de la imagen */}
            {imagePreview && (
              <div style={{
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: colors.backgroundTertiary,
                textAlign: 'center',
              }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: `1px solid ${colors.borderColor}`,
                  }}
                />
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  color: colors.textSecondary,
                }}>
                  Vista previa de la imagen
                </div>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="price" style={formStyles.label}>
              Precio *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onFocus={() => handleFocus('price')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.price, focusedField === 'price')}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.price && (
              <div style={formStyles.errorMessage}>
                <span>{errors.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Descripción en fila completa */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="description" style={formStyles.label}>
            Descripción *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onFocus={() => handleFocus('description')}
            onBlur={handleBlur}
            style={getTextareaStyles(!!errors.description, focusedField === 'description')}
            placeholder="Descripción detallada del producto..."
          />
          {errors.description && (
            <div style={formStyles.errorMessage}>
              <span>{errors.description}</span>
            </div>
          )}
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
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
