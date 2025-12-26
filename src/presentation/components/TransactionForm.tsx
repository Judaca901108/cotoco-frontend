import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaBox, FaStore, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { formStyles, getInputStyles, getSelectStyles, getTextareaStyles } from '../../shared/formStyles';
import { authenticatedFetch } from '../../infrastructure/authService';
import { useAuth } from '../../application/contexts/AuthContext';
import colors from '../../shared/colors';
import { API_BASE_URL } from '../../config/apiConfig';

type Inventory = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  pointOfSaleId: number;
  pointOfSaleName: string;
  stockQuantity: number;
};

type PointOfSale = {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
};

type TransactionFormProps = {
  inventories: Inventory[];
  onSubmit: (data: {
    inventoryId: number;
    transactionType: 'sale' | 'restock' | 'adjustment' | 'transfer';
    quantity: number;
    remarks: string;
    sourcePointOfSaleId?: number;
    destinationPointOfSaleId?: number;
  }) => void;
  onCancel: () => void;
  title?: string;
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  inventories,
  onSubmit,
  onCancel,
  title = "Nueva Transacción"
}) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    pointOfSaleId: 0,
    inventoryId: 0,
    transactionType: 'sale' as 'sale' | 'restock' | 'adjustment' | 'transfer',
    quantity: 0,
    remarks: '',
    sourcePointOfSaleId: 0,
    destinationPointOfSaleId: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);

  // Cargar puntos de venta
  useEffect(() => {
    const loadPointsOfSale = async () => {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/point-of-sale`);
        if (response.ok) {
          const data = await response.json();
          setPointsOfSale(data);
        }
      } catch (error) {
        console.error('Error loading points of sale:', error);
      }
    };

    loadPointsOfSale();
  }, []);

  // Tipos de transacciones disponibles según el rol del usuario
  const getAllTransactionTypes = () => [
    { value: 'sale', label: 'Venta', description: 'Reduce el inventario por venta de productos' },
    { value: 'restock', label: 'Reabastecimiento', description: 'Aumenta el inventario por compra o reposición' },
    { value: 'adjustment', label: 'Ajuste', description: 'Corrección de inventario (productos dañados, pérdidas, etc.)' },
    { value: 'transfer', label: 'Transferencia', description: 'Movimiento de productos entre puntos de venta' },
  ];

  // Filtrar tipos de transacciones según el rol
  const transactionTypes = isAdmin 
    ? getAllTransactionTypes()  // Admin puede crear todos los tipos
    : getAllTransactionTypes().filter(type => 
        type.value === 'sale' || type.value === 'adjustment'  // Usuario solo puede crear ventas y ajustes
      );

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.pointOfSaleId) {
      newErrors.pointOfSaleId = 'Debe seleccionar un punto de venta.';
    }
    
    if (!formData.inventoryId) {
      newErrors.inventoryId = 'Debe seleccionar un inventario.';
    }
    
    if (!formData.transactionType) {
      newErrors.transactionType = 'Debe seleccionar un tipo de transacción.';
    }
    
    if (formData.quantity === 0) {
      newErrors.quantity = 'La cantidad no puede ser cero.';
    }
    
    // Validación de stock disponible
    if (formData.inventoryId && formData.quantity !== 0) {
      const selectedInventory = inventories.find(inv => inv.id === formData.inventoryId);
      if (selectedInventory) {
        const isReducingTransaction = formData.transactionType === 'sale' || 
                                     formData.transactionType === 'transfer' || 
                                     (formData.transactionType === 'adjustment' && formData.quantity < 0);
        
        if (isReducingTransaction && Math.abs(formData.quantity) > selectedInventory.stockQuantity) {
          newErrors.quantity = `No hay suficiente stock. Disponible: ${selectedInventory.stockQuantity} unidades.`;
        }
      }
    }
    
    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Los comentarios son obligatorios.';
    }
    
    // Validaciones específicas por tipo
    if (formData.transactionType === 'transfer') {
      if (!formData.destinationPointOfSaleId) {
        newErrors.destinationPointOfSaleId = 'Debe seleccionar el punto de venta destino.';
      }
      if (formData.pointOfSaleId === formData.destinationPointOfSaleId) {
        newErrors.destinationPointOfSaleId = 'El destino debe ser diferente al origen.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'quantity' || name === 'pointOfSaleId' || name === 'inventoryId' || name === 'sourcePointOfSaleId' || name === 'destinationPointOfSaleId' 
          ? Number(value) 
          : value
      };
      
      // Si cambia el punto de venta, resetear el inventario seleccionado
      if (name === 'pointOfSaleId') {
        newData.inventoryId = 0;
        // También resetear el destino si es una transferencia
        if (newData.transactionType === 'transfer') {
          newData.destinationPointOfSaleId = 0;
        }
      }
      
      // Si cambia el tipo de transacción, resetear campos específicos
      if (name === 'transactionType') {
        newData.destinationPointOfSaleId = 0;
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        inventoryId: formData.inventoryId,
        transactionType: formData.transactionType,
        quantity: formData.quantity,
        remarks: formData.remarks,
        ...(formData.transactionType === 'transfer' && {
          sourcePointOfSaleId: formData.pointOfSaleId, // El origen es el punto de venta seleccionado
          destinationPointOfSaleId: formData.destinationPointOfSaleId,
        }),
      };
      onSubmit(submissionData);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  // Obtener puntos de venta que tienen inventario
  const pointsOfSaleWithInventory = pointsOfSale.filter(pos => 
    inventories.some(inv => inv.pointOfSaleId === pos.id)
  );

  // Obtener inventarios filtrados por punto de venta seleccionado
  const filteredInventories = formData.pointOfSaleId 
    ? inventories.filter(inv => inv.pointOfSaleId === formData.pointOfSaleId)
    : [];

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>{title}</h2>

      <form onSubmit={handleSubmit}>
        {/* Selección de punto de venta */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="pointOfSaleId" style={formStyles.label}>
            <FaStore style={{ marginRight: '8px' }} />
            Punto de Venta *
          </label>
          <select
            id="pointOfSaleId"
            name="pointOfSaleId"
            value={formData.pointOfSaleId}
            onChange={handleChange}
            onFocus={() => handleFocus('pointOfSaleId')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.pointOfSaleId, focusedField === 'pointOfSaleId')}
          >
            <option value={0}>Seleccione un punto de venta</option>
            {pointsOfSaleWithInventory.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
          {errors.pointOfSaleId && (
            <div style={formStyles.errorMessage}>
              <span>{errors.pointOfSaleId}</span>
            </div>
          )}
        </div>

        {/* Selección de inventario */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="inventoryId" style={formStyles.label}>
            <FaBox style={{ marginRight: '8px' }} />
            Producto en Inventario *
          </label>
          <select
            id="inventoryId"
            name="inventoryId"
            value={formData.inventoryId}
            onChange={handleChange}
            onFocus={() => handleFocus('inventoryId')}
            onBlur={handleBlur}
            style={{
              ...getSelectStyles(!!errors.inventoryId, focusedField === 'inventoryId'),
              opacity: formData.pointOfSaleId ? 1 : 0.6,
            }}
            disabled={!formData.pointOfSaleId}
          >
            <option value={0}>
              {formData.pointOfSaleId 
                ? 'Seleccione un producto' 
                : 'Primero seleccione un punto de venta'
              }
            </option>
            {filteredInventories.map((inventory) => (
              <option key={inventory.id} value={inventory.id}>
                {inventory.productName} (SKU: {inventory.productSku})
              </option>
            ))}
          </select>
          {errors.inventoryId && (
            <div style={formStyles.errorMessage}>
              <span>{errors.inventoryId}</span>
            </div>
          )}
          {formData.pointOfSaleId && filteredInventories.length === 0 && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${colors.warning}30`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: colors.warning,
            }}>
              <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
              Este punto de venta no tiene productos en inventario
            </div>
          )}
        </div>

        {/* Tipo de transacción */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="transactionType" style={formStyles.label}>
            <FaExchangeAlt style={{ marginRight: '8px' }} />
            Tipo de Transacción *
          </label>
          <select
            id="transactionType"
            name="transactionType"
            value={formData.transactionType}
            onChange={handleChange}
            onFocus={() => handleFocus('transactionType')}
            onBlur={handleBlur}
            style={getSelectStyles(!!errors.transactionType, focusedField === 'transactionType')}
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.transactionType && (
            <div style={formStyles.errorMessage}>
              <span>{errors.transactionType}</span>
            </div>
          )}
          
          {/* Descripción del tipo seleccionado */}
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: `1px solid ${colors.primaryColor}30`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: colors.textSecondary,
          }}>
            <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
            {transactionTypes.find(t => t.value === formData.transactionType)?.description}
          </div>

          {/* Mensaje informativo para usuarios normales */}
          {!isAdmin && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${colors.warning}30`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: colors.warning,
            }}>
              <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
              <strong>Restricción de usuario:</strong> Solo puedes crear transacciones de venta y ajuste.
            </div>
          )}
        </div>

        {/* Cantidad */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="quantity" style={formStyles.label}>
            Cantidad *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            onFocus={() => handleFocus('quantity')}
            onBlur={handleBlur}
            style={getInputStyles(!!errors.quantity, focusedField === 'quantity')}
            placeholder="Ingrese la cantidad (positiva o negativa)"
          />
          {errors.quantity && (
            <div style={formStyles.errorMessage}>
              <span>{errors.quantity}</span>
            </div>
          )}
          
          {/* Información de stock disponible */}
          {formData.inventoryId && (() => {
            const selectedInventory = inventories.find(inv => inv.id === formData.inventoryId);
            if (selectedInventory) {
              return (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${colors.success}30`,
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: colors.success,
                }}>
                  <FaInfoCircle style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                  Stock disponible: <strong>{selectedInventory.stockQuantity} unidades</strong>
                </div>
              );
            }
            return null;
          })()}
          
          <div style={{
            marginTop: '8px',
            fontSize: '0.8rem',
            color: colors.textSecondary,
          }}>
            • Positiva (+) para aumentar inventario (reabastecimiento)<br/>
            • Negativa (-) para reducir inventario (venta, ajuste, transferencia)
          </div>
        </div>

        {/* Campos específicos para transferencias */}
        {formData.transactionType === 'transfer' && (
          <div style={formStyles.fieldContainer}>
            {/* Mostrar punto de venta origen (solo lectura) */}
            <div style={formStyles.fieldContainer}>
              <label style={formStyles.label}>
                <FaStore style={{ marginRight: '8px' }} />
                Punto de Venta Origen
              </label>
              <div style={{
                ...getSelectStyles(false, false),
                backgroundColor: colors.backgroundTertiary,
                color: colors.textSecondary,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}>
                {pointsOfSaleWithInventory.find(pos => pos.id === formData.pointOfSaleId)?.name || 'No seleccionado'}
              </div>
              <div style={{
                marginTop: '4px',
                fontSize: '0.8rem',
                color: colors.textSecondary,
                fontStyle: 'italic',
              }}>
                El origen es el punto de venta seleccionado arriba
              </div>
            </div>

            {/* Selección de punto de venta destino */}
            <div style={formStyles.fieldContainer}>
              <label htmlFor="destinationPointOfSaleId" style={formStyles.label}>
                <FaStore style={{ marginRight: '8px' }} />
                Punto de Venta Destino *
              </label>
              <select
                id="destinationPointOfSaleId"
                name="destinationPointOfSaleId"
                value={formData.destinationPointOfSaleId}
                onChange={handleChange}
                onFocus={() => handleFocus('destinationPointOfSaleId')}
                onBlur={handleBlur}
                style={getSelectStyles(!!errors.destinationPointOfSaleId, focusedField === 'destinationPointOfSaleId')}
              >
                <option value={0}>Seleccione el destino</option>
                {pointsOfSaleWithInventory
                  .filter(pos => pos.id !== formData.pointOfSaleId) // Excluir el punto de venta origen
                  .map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
              </select>
              {errors.destinationPointOfSaleId && (
                <div style={formStyles.errorMessage}>
                  <span>{errors.destinationPointOfSaleId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comentarios */}
        <div style={formStyles.fieldContainer}>
          <label htmlFor="remarks" style={formStyles.label}>
            Comentarios *
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onFocus={() => handleFocus('remarks')}
            onBlur={handleBlur}
            style={getTextareaStyles(!!errors.remarks, focusedField === 'remarks')}
            placeholder="Describa la transacción (ej: Venta a cliente, Reabastecimiento desde proveedor, etc.)"
            rows={3}
          />
          {errors.remarks && (
            <div style={formStyles.errorMessage}>
              <span>{errors.remarks}</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div style={formStyles.buttonContainer}>
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
            Crear Transacción
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
