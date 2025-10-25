import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaStore, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import colors from '../../shared/colors';

const BASE_PATH = 'http://localhost:3000';

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

const EditPointOfSalePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pointOfSale, setPointOfSale] = useState<PointOfSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: '',
    type: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const pointOfSaleTypes = [
    { value: 'Puntos Fijos', label: 'Puntos Fijos' },
    { value: 'Puntos Móviles', label: 'Puntos Móviles' },
    { value: 'Bodega', label: 'Bodega' },
    { value: 'Centro de Distribución', label: 'Centro de Distribución' }
  ];

  useEffect(() => {
    if (!id) return;
    
    loadPointOfSale();
  }, [id]);

  const loadPointOfSale = async () => {
    try {
      const response = await authenticatedFetch(`${BASE_PATH}/point-of-sale/${id}`);
      if (!response.ok) {
        throw new Error('Punto de venta no encontrado');
      }
      
      const pointData = await response.json();
      setPointOfSale(pointData);
      
      setFormData({
        name: pointData.name || '',
        address: pointData.address || '',
        location: pointData.location || '',
        type: pointData.type || ''
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
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria.';
    if (!formData.type.trim()) newErrors.type = 'El tipo es obligatorio.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !pointOfSale) return;

    setSaving(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${BASE_PATH}/point-of-sale/${pointOfSale.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar el punto de venta: ${response.status} - ${errorText}`);
      }

      alert('✅ Punto de venta actualizado exitosamente');
      navigate(`/dashboard/point-of-sales/${pointOfSale.id}`);
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
          <div style={{ color: colors.textSecondary }}>Cargando punto de venta...</div>
        </div>
      </div>
    );
  }

  if (error && !pointOfSale) {
    return (
      <div style={formStyles.formContainer}>
        <button
          onClick={() => navigate('/dashboard/point-of-sales')}
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
          Volver a Puntos de Venta
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
        onClick={() => navigate(`/dashboard/point-of-sales/${pointOfSale?.id}`)}
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
        Volver al Punto de Venta
      </button>

      <h2 style={formStyles.formTitle}>Editar Punto de Venta</h2>
      
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
            placeholder="Ej: Hayuelos, Centro Comercial"
          />
          {errors.name && (
            <div style={formStyles.errorMessage}>
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Dirección */}
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
            placeholder="Ej: CC Hayuelos, Local 123"
          />
          {errors.address && (
            <div style={formStyles.errorMessage}>
              <span>{errors.address}</span>
            </div>
          )}
        </div>

        {/* Ubicación y Tipo en la misma fila */}
        <div style={formStyles.fieldGrid}>
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
              placeholder="Ej: Bogotá, Cundinamarca"
            />
            {errors.location && (
              <div style={formStyles.errorMessage}>
                <span>{errors.location}</span>
              </div>
            )}
          </div>

          <div style={formStyles.fieldContainer}>
            <label htmlFor="type" style={formStyles.label}>
              <FaBuilding style={{ marginRight: '8px' }} />
              Tipo *
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
              <option value="">Selecciona un tipo</option>
              {pointOfSaleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <div style={formStyles.errorMessage}>
                <span>{errors.type}</span>
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
            Información del Punto de Venta
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: formStyles.errorMessage.color,
            margin: 0,
          }}>
            • El nombre debe ser único y descriptivo<br/>
            • La dirección debe incluir detalles específicos del local<br/>
            • La ubicación debe incluir ciudad y departamento/estado
          </p>
        </div>

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/point-of-sales/${pointOfSale?.id}`)}
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

export default EditPointOfSalePage;

