// Configuración centralizada de la API
// Para desarrollo móvil: Usa la IP local de tu computadora en lugar de localhost

// Puerto del backend (ajusta si tu backend usa otro puerto)
const BACKEND_PORT = '3000';

// Obtener la URL base de la API
const getApiBaseUrl = (): string => {
  // 1. Prioridad: Variable de entorno (para producción o configuración específica)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Detectar automáticamente desde la URL actual del frontend
  // Si accedes desde http://192.168.x.x:3000 (frontend), usará esa IP para el backend
  const hostname = window.location.hostname;
  
  // Si ya estamos usando una IP (no localhost), usar esa IP para el backend
  // Nota: El frontend puede estar en puerto 3000, pero el backend también debe estar accesible
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Usar la misma IP pero con el puerto del backend
    return `http://${hostname}:${BACKEND_PORT}`;
  }
  
  // 3. Para desarrollo local en desktop, usar localhost
  return `http://localhost:${BACKEND_PORT}`;
};

// Exportar la URL base de la API
export const API_BASE_URL = getApiBaseUrl();

// Función helper para construir URLs de imágenes
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return `${API_BASE_URL}/product/image/${imagePath}`;
};

// Log para debugging (siempre mostrar para ayudar con debugging móvil)
console.log('═══════════════════════════════════════════════════════');
console.log('🔧 CONFIGURACIÓN DE API');
console.log('═══════════════════════════════════════════════════════');
console.log('📍 API Base URL:', API_BASE_URL);
console.log('🌐 Frontend URL:', window.location.origin);
console.log('🖥️  Hostname detectado:', window.location.hostname);
console.log('🔌 Puerto backend configurado:', BACKEND_PORT);
console.log('═══════════════════════════════════════════════════════');
console.log('💡 Para desarrollo móvil:');
console.log('   1. Accede desde: http://TU_IP_LOCAL:3000');
console.log('   2. Backend debe estar en:', API_BASE_URL);
console.log('   3. Ambos en la misma red WiFi');
console.log('═══════════════════════════════════════════════════════');

