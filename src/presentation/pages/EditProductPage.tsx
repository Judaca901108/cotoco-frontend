import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaBox, FaImage, FaDollarSign, FaTag, FaList } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  imagePath?: string;
  barcode?: string; // Código de barras
};

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '',
    barcode: '',
    image: null as File | null
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await authenticatedFetch(`${BASE_PATH}/product/${id}`);
      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }
      
      const productData = await response.json();
      setProduct(productData);
      
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        sku: productData.sku || '',
        category: productData.category || '',
        barcode: productData.barcode || '',
        image: null
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!formData.price.trim()) newErrors.price = 'El precio es obligatorio.';
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número válido mayor a 0.';
    }
    if (!formData.sku.trim()) newErrors.sku = 'El SKU es obligatorio.';
    if (!formData.category.trim()) newErrors.category = 'La categoría es obligatoria.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !product) return;

    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('category', formData.category);
      
      if (formData.barcode) {
        formDataToSend.append('barcode', formData.barcode);
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await authenticatedFetch(`${BASE_PATH}/product/${product.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar el producto: ${response.status} - ${errorText}`);
      }

      alert('✅ Producto actualizado exitosamente');
      navigate(`/dashboard/products/${product.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  if (loading) {
    return (
      <div style={formStyles.formContainer}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.textSecondary }}>Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div style={formStyles.formContainer}>
        <button
          onClick={() => navigate('/dashboard/products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.buttonSecondary,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderColor}`,
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          <FaArrowLeft />
          Volver a Productos
        </button>
        
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          color: colors.error,
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>❌</div>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={formStyles.formContainer}>
      {/* Botón de regreso */}
      <button
        onClick={() => navigate(`/dashboard/products/${product?.id}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: colors.buttonSecondary,
          color: colors.textSecondary,
          border: `1px solid ${colors.borderColor}`,
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '30px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.hoverBackground;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonSecondary;
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        <FaArrowLeft />
        Volver al Producto
      </button>

      <h2 style={formStyles.formTitle}>Editar Producto</h2>
      
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: colors.error,
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="name" style={formStyles.label}>
            <FaBox style={{ marginRight: '8px' }} />
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
            placeholder="Ej: Laptop Dell XPS 13"
          />
          {errors.name && (
            <div style={formStyles.errorMessage}>
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="description" style={formStyles.label}>
            <FaList style={{ marginRight: '8px' }} />
            Descripción *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onFocus={() => handleFocus('description')}
            onBlur={handleBlur}
            style={{
              ...getInputStyles(!!errors.description, focusedField === 'description'),
              minHeight: '100px',
              resize: 'vertical',
            }}
            placeholder="Descripción detallada del producto..."
          />
          {errors.description && (
            <div style={formStyles.errorMessage}>
              <span>{errors.description}</span>
            </div>
          )}
        </div>

        {/* Precio y SKU en la misma fila */}
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldContainer}>
            <label htmlFor="price" style={formStyles.label}>
              <FaDollarSign style={{ marginRight: '8px' }} />
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

          <div style={formStyles.fieldContainer}>
            <label htmlFor="sku" style={formStyles.label}>
              <FaTag style={{ marginRight: '8px' }} />
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
              placeholder="Ej: DELL-XPS13-001"
            />
            {errors.sku && (
              <div style={formStyles.errorMessage}>
                <span>{errors.sku}</span>
              </div>
            )}
          </div>
        </div>

        {/* Código de barras */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="barcode" style={formStyles.label}>
            Código de Barras
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            onFocus={() => handleFocus('barcode')}
            onBlur={handleBlur}
            style={getInputStyles(!!errors.barcode, focusedField === 'barcode')}
            placeholder="Ej: 1234567890123"
          />
          {errors.barcode && (
            <div style={formStyles.errorMessage}>
              <span>{errors.barcode}</span>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="category" style={formStyles.label}>
            Categoría *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            onFocus={() => handleFocus('category')}
            onBlur={handleBlur}
            style={getInputStyles(!!errors.category, focusedField === 'category')}
            placeholder="Ej: Electrónicos, Ropa, Hogar..."
          />
          {errors.category && (
            <div style={formStyles.errorMessage}>
              <span>{errors.category}</span>
            </div>
          )}
        </div>

        {/* Imagen */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="image" style={formStyles.label}>
            <FaImage style={{ marginRight: '8px' }} />
            Imagen del Producto
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            style={{
              ...getInputStyles(false, focusedField === 'image'),
              padding: '8px',
            }}
          />
          <div style={{
            fontSize: '0.8rem',
            color: colors.textSecondary,
            marginTop: '4px',
          }}>
            {product?.imagePath ? (
              <div>
                <div style={{ 
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginBottom: '8px',
                }}>
                  <strong style={{ color: '#16a34a' }}>✅ Imagen actual:</strong> {product.imagePath}
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                }}>
                  <strong style={{ color: '#2563eb' }}>💡 Opcional:</strong> Selecciona una nueva imagen para reemplazarla, o déjala vacía para mantener la actual
                </div>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '6px',
                padding: '8px 12px',
              }}>
                <strong style={{ color: '#d97706' }}>⚠️ Sin imagen:</strong> Selecciona una imagen para el producto
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/products/${product?.id}`)}
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
          <button
            type="submit"
            disabled={saving}
            style={{
              ...formStyles.primaryButton,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <FaSave />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
