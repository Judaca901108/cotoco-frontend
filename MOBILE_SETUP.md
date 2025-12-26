# 📱 Configuración para Desarrollo Móvil

## Problema
Cuando accedes a la aplicación desde tu celular usando `localhost`, el dispositivo móvil intenta conectarse a sí mismo en lugar de a tu computadora donde está corriendo el servidor backend.

## Solución

### Opción 1: Acceder usando tu IP local (Recomendado)

1. **Encuentra tu IP local:**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. **Tu IP local es:** `192.168.80.63` (ya detectada)

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm start
   ```

4. **Accede desde tu celular usando:**
   ```
   http://192.168.80.63:3000
   ```
   
   ⚠️ **Importante:** Asegúrate de que tu celular y tu computadora estén en la misma red WiFi.

### Opción 2: Configurar la IP manualmente

Si tu IP cambia o quieres usar una diferente:

1. Edita el archivo `src/config/apiConfig.ts`
2. Cambia la línea:
   ```typescript
   return 'http://localhost:3000';
   ```
   Por:
   ```typescript
   return 'http://TU_IP_LOCAL:3000';
   ```
   Por ejemplo: `return 'http://192.168.80.63:3000';`

### Opción 3: Usar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto:
   ```
   REACT_APP_API_URL=http://192.168.80.63:3000
   ```

2. Reinicia el servidor de desarrollo.

## Verificación

1. Abre la consola del navegador en tu celular (o usa las herramientas de desarrollo remoto)
2. Deberías ver en la consola:
   ```
   🔧 API Base URL: http://192.168.80.63:3000
   💡 Para desarrollo móvil, accede desde: http://TU_IP_LOCAL:3000
   ```

## Troubleshooting

### Error: "NetworkError when attempting to fetch resource"
- ✅ Verifica que tu celular y computadora estén en la misma red WiFi
- ✅ Verifica que el servidor backend esté corriendo en el puerto 3000
- ✅ Verifica que el firewall no esté bloqueando las conexiones
- ✅ Intenta acceder desde el celular usando la IP directamente: `http://TU_IP:3000`

### El servidor no responde desde el móvil
- Verifica que el servidor de React esté configurado para aceptar conexiones desde la red local
- Por defecto, `npm start` solo acepta conexiones desde localhost
- Puedes iniciar con: `HOST=0.0.0.0 npm start` para aceptar conexiones desde cualquier IP

### La IP cambia frecuentemente
- Considera usar una IP estática en tu router
- O usa la opción de variables de entorno y actualiza el `.env` cuando cambie

