# Verificación de Endpoint para Actualizar Stock Mínimo

## Endpoint Utilizado

El frontend está utilizando el siguiente endpoint para actualizar el stock mínimo:

```
PATCH /inventory/:id
```

### Payload enviado:
```json
{
  "minimumStock": <número>
}
```

## Verificación del Backend

Para verificar si el endpoint está funcionando correctamente, puedes probar con el siguiente comando cURL:

```bash
curl -X PATCH "http://localhost:3000/inventory/<INVENTORY_ID>" \
  --header "Authorization: Bearer <TU_JWT_TOKEN>" \
  --header "Content-Type: application/json" \
  --data '{
    "minimumStock": 10
  }'
```

### Ejemplo completo:
```bash
# 1. Obtener un token JWT (hacer login)
curl -X POST "http://localhost:3000/auth/login" \
  --header "Content-Type: application/json" \
  --data '{
    "username": "admin",
    "password": "tu_password"
  }'

# 2. Usar el token para actualizar el stock mínimo
curl -X PATCH "http://localhost:3000/inventory/1" \
  --header "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --header "Content-Type: application/json" \
  --data '{
    "minimumStock": 10
  }'
```

## Funcionalidad Implementada en el Frontend

1. **Botón de edición**: En la columna "Stock Mínimo" de la tabla de inventario, ahora hay un botón "Editar" junto al valor actual.

2. **Modo de edición**: Al hacer clic en "Editar", el valor se convierte en un campo de entrada editable.

3. **Guardar/Cancelar**: 
   - Botón "✓ Guardar" para confirmar los cambios
   - Botón "✕ Cancelar" para descartar los cambios
   - También se puede presionar Enter para guardar

4. **Validación**: 
   - El valor debe ser un número válido
   - El valor debe ser mayor o igual a 0

5. **Actualización automática**: Después de guardar, la lista de inventarios se recarga automáticamente para mostrar el valor actualizado.

## Nota Importante

El mismo endpoint PATCH `/inventory/:id` ya se está utilizando exitosamente para actualizar el campo `onDisplay` (En Exhibición). Si ese endpoint funciona para `onDisplay`, debería funcionar también para `minimumStock`, siempre que el backend acepte ese campo en el body del PATCH.

Si el endpoint no acepta `minimumStock`, será necesario actualizar el backend para que acepte este campo en las actualizaciones PATCH del inventario.

