import React, { useState } from 'react';
import { FaSave, FaTimes, FaUser, FaPhone, FaIdCard, FaLock, FaUserShield } from 'react-icons/fa';
import { getFormStyles, getInputStyles, getSelectStyles } from '../../shared/formStyles';
import { useTheme } from '../../application/contexts/ThemeContext';

type UserFormProps = {
  initialData?: { 
    username: string; 
    password?: string; 
    name: string; 
    celular: string; 
    documentoIdentidad: string;
    role?: string;
  };
  onSubmit: (data: { 
    username: string; 
    password: string; 
    name: string; 
    celular: string; 
    documentoIdentidad: string;
    role: string;
  }) => void;
  onCancel?: () => void;
  title?: string;
  isEdit?: boolean;
};

const UserForm: React.FC<UserFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  title = "Gestión de Usuario",
  isEdit = false
}) => {
  const { theme } = useTheme();
  const formStyles = getFormStyles(theme);
  const [formData, setFormData] = useState(initialData || {
    username: '',
    password: '',
    name: '',
    celular: '',
    documentoIdentidad: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio.';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres.';
    }
    
    if (!isEdit && (!formData.password || !formData.password.trim())) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio.';
    }
    
    if (!formData.celular.trim()) {
      newErrors.celular = 'El número de celular es obligatorio.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.celular.replace(/\s/g, ''))) {
      newErrors.celular = 'Ingrese un número de celular válido.';
    }
    
    if (!formData.documentoIdentidad.trim()) {
      newErrors.documentoIdentidad = 'El documento de identidad es obligatorio.';
    } else if (!/^\d{7,11}$/.test(formData.documentoIdentidad)) {
      newErrors.documentoIdentidad = 'El documento debe tener entre 7 y 11 dígitos.';
    }
    if (!formData.role) {
      newErrors.role = 'El rol es obligatorio.';
    }
    
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
      const submissionData = {
        ...formData,
        role: formData.role || 'user', // Asegurar que siempre tenga un valor
        password: formData.password || 'temp_password', // Para edición, si no se cambia la contraseña
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
        <div style={formStyles.fieldGrid}>
          {/* Username */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="username" style={formStyles.label}>
              <FaUser style={{ marginRight: '8px' }} />
              Nombre de Usuario *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleFocus('username')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.username, focusedField === 'username', theme)}
              placeholder="usuario_test"
            />
            {errors.username && (
              <div style={formStyles.errorMessage}>
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="password" style={formStyles.label}>
              <FaLock style={{ marginRight: '8px' }} />
              Contraseña {!isEdit && '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.password, focusedField === 'password', theme)}
              placeholder={isEdit ? "Dejar vacío para mantener la actual" : "password123"}
            />
            {errors.password && (
              <div style={formStyles.errorMessage}>
                <span>{errors.password}</span>
              </div>
            )}
            {isEdit && (
              <div style={{
                marginTop: '8px',
                fontSize: '0.8rem',
                color: theme.textSecondary,
              }}>
                Dejar vacío para mantener la contraseña actual
              </div>
            )}
          </div>
        </div>

        <div style={formStyles.fieldGrid}>
          {/* Name */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="name" style={formStyles.label}>
              <FaUser style={{ marginRight: '8px' }} />
              Nombre Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.name, focusedField === 'name', theme)}
              placeholder="Usuario de Prueba"
            />
            {errors.name && (
              <div style={formStyles.errorMessage}>
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Celular */}
          <div style={formStyles.fieldContainer}>
            <label htmlFor="celular" style={formStyles.label}>
              <FaPhone style={{ marginRight: '8px' }} />
              Celular *
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              onFocus={() => handleFocus('celular')}
              onBlur={handleBlur}
              style={getInputStyles(!!errors.celular, focusedField === 'celular', theme)}
              placeholder="+57 300 555 6666"
            />
            {errors.celular && (
              <div style={formStyles.errorMessage}>
                <span>{errors.celular}</span>
              </div>
            )}
          </div>
        </div>

        {/* Documento de Identidad */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="documentoIdentidad" style={formStyles.label}>
            <FaIdCard style={{ marginRight: '8px' }} />
            Documento de Identidad *
          </label>
          <input
            type="text"
            id="documentoIdentidad"
            name="documentoIdentidad"
            value={formData.documentoIdentidad}
            onChange={handleChange}
            onFocus={() => handleFocus('documentoIdentidad')}
            onBlur={handleBlur}
            style={getInputStyles(!!errors.documentoIdentidad, focusedField === 'documentoIdentidad', theme)}
            placeholder="5555555555"
          />
          {errors.documentoIdentidad && (
            <div style={formStyles.errorMessage}>
              <span>{errors.documentoIdentidad}</span>
            </div>
          )}
        </div>

        {/* Rol del Usuario */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="role" style={formStyles.label}>
            <FaUserShield style={{ marginRight: '8px' }} />
            Rol del Usuario *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            onFocus={() => handleFocus('role')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.role, focusedField === 'role', theme)}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.role && (
            <div style={formStyles.errorMessage}>
              <span>{errors.role}</span>
            </div>
          )}
          <div style={{
            marginTop: '8px',
            fontSize: '0.8rem',
            color: theme.textSecondary,
          }}>
            • <strong>Usuario:</strong> Solo puede ver el módulo de transacciones<br/>
            • <strong>Administrador:</strong> Acceso completo a todos los módulos
          </div>
        </div>

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
            {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
