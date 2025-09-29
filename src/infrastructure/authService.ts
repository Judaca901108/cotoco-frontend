// Servicio de autenticación para manejar JWT
const BASE_PATH = "http://localhost:3000";

export interface User {
  id: number;
  username: string;
  name: string;
  celular: string;
  documentoIdentidad: string;
  isActive: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Cargar token y usuario del localStorage al inicializar
    this.loadFromStorage();
  }

  /**
   * Realizar login y obtener token JWT
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_PATH}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      
      // Guardar token y usuario
      this.setToken(data.token);
      this.setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Obtener el token JWT actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtener el usuario actual
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  /**
   * Establecer token y guardarlo en localStorage
   */
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Establecer usuario y guardarlo en localStorage
   */
  private setUser(user: User): void {
    this.user = user;
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Cargar token y usuario desde localStorage
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        this.token = token;
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Cerrar sesión y limpiar datos
   */
  logout(): void {
    this.clearAuth();
  }

  /**
   * Limpiar token, usuario y localStorage
   */
  private clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Obtener headers de autorización para peticiones HTTP
   */
  getAuthHeaders(): { [key: string]: string } {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Verificar si el token está próximo a expirar (opcional)
   */
  isTokenExpiring(): boolean {
    if (!this.token) return true;
    
    try {
      // Decodificar el JWT para obtener la fecha de expiración
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      const now = Date.now();
      const timeUntilExpiry = exp - now;
      
      // Considerar que está expirando si quedan menos de 5 minutos
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

  /**
   * Obtener el rol del usuario desde el JWT
   */
  getUserRole(): string | null {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error('Error al decodificar el rol del token:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  /**
   * Verificar si el usuario es usuario normal
   */
  isUser(): boolean {
    return this.getUserRole() === 'user';
  }
}

// Crear instancia singleton
export const authService = new AuthService();

// Función helper para hacer peticiones HTTP autenticadas
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeaders = authService.getAuthHeaders();
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, requestOptions);
  
  // Si la respuesta es 401 (Unauthorized), el token puede haber expirado
  if (response.status === 401) {
    authService.logout();
    // Redirigir al login
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  return response;
};
