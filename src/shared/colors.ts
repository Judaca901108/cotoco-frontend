// shared/colors.ts
// Este archivo mantiene compatibilidad con el código existente
// Los colores ahora vienen del ThemeContext
import { darkTheme } from './themeColors';

// Exportar darkTheme como default para compatibilidad
// Los componentes que usen useTheme() obtendrán el tema actual
const colors = darkTheme;

export default colors;
  