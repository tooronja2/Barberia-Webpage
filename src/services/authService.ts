// 🔒 Servicio de Autenticación Segura
// Solo valida credenciales, NUNCA expone contraseñas

interface LoginResponse {
  success: boolean;
  token?: string;
  usuario?: {
    nombre: string;
    rol: string;
    permisos: string[];
    barberoAsignado?: string;
  };
  error?: string;
}

interface SessionData {
  token: string;
  usuario: string;
  rol: string;
  permisos: string[];
  expiresAt: number;
  barberoAsignado?: string;
}

class AuthService {
  private static readonly STORAGE_KEY = 'barberia_session';
  private static readonly API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  private static readonly API_KEY = import.meta.env.VITE_API_SECRET_KEY;
  private static readonly SESSION_TIMEOUT = parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000; // 24 horas
  private static readonly MAX_ATTEMPTS = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 3;
  private static readonly LOCKOUT_DURATION = parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 900000; // 15 min

  // 🔐 Login seguro - SOLO validación
  static async login(usuario: string, password: string): Promise<LoginResponse> {
    try {
      // Verificar si está bloqueado por intentos fallidos
      if (this.isLockedOut()) {
        return {
          success: false,
          error: 'Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.'
        };
      }

      console.log('🔐 Iniciando validación segura...');

      const requestData = {
        action: 'validarLogin',
        usuario: usuario.trim(),
        password: password,
        apiKey: this.API_KEY,
        timestamp: Date.now()
      };

      const formData = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.token) {
        // Login exitoso - limpiar intentos fallidos
        this.clearLoginAttempts();
        
        // Guardar sesión segura
        this.saveSession({
          token: data.token,
          usuario: data.usuario.nombre,
          rol: data.usuario.rol,
          permisos: data.usuario.permisos,
          barberoAsignado: data.usuario.barberoAsignado,
          expiresAt: Date.now() + this.SESSION_TIMEOUT
        });

        console.log('✅ Login seguro exitoso');
        return {
          success: true,
          token: data.token,
          usuario: data.usuario
        };
      } else {
        // Login fallido - incrementar intentos
        this.incrementLoginAttempts();
        console.log('❌ Login fallido');
        return {
          success: false,
          error: data.error || 'Credenciales incorrectas'
        };
      }
    } catch (error) {
      console.error('❌ Error en login seguro:', error);
      this.incrementLoginAttempts();
      return {
        success: false,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  // 🔓 Logout seguro
  static logout(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      // También limpiar storage legacy si existe
      localStorage.removeItem('barberia_usuario');
      localStorage.removeItem('barberia_rol');
      localStorage.removeItem('barberia_permisos');
      localStorage.removeItem('barberia_barbero_asignado');
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  // 🔍 Verificar sesión válida
  static isAuthenticated(): boolean {
    try {
      const session = this.getSession();
      if (!session) return false;
      
      // Verificar si la sesión expiró
      if (Date.now() > session.expiresAt) {
        console.log('⏰ Sesión expirada');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // 📋 Obtener datos del usuario actual
  static getCurrentUser(): SessionData | null {
    try {
      const session = this.getSession();
      if (!session || !this.isAuthenticated()) {
        return null;
      }
      return session;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // 🛡️ Verificar permisos
  static hasPermission(permission: string): boolean {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;
      
      return user.permisos.includes(permission) || user.permisos.includes('admin');
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  // 💾 Guardar sesión
  private static saveSession(session: SessionData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }

  // 📖 Obtener sesión
  private static getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionStr) return null;
      
      return JSON.parse(sessionStr);
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  }

  // 🚫 Control de intentos fallidos
  private static incrementLoginAttempts(): void {
    try {
      const attempts = this.getLoginAttempts();
      const newAttempts = {
        count: attempts.count + 1,
        timestamp: Date.now()
      };
      
      localStorage.setItem('login_attempts', JSON.stringify(newAttempts));
      console.log(`⚠️ Intentos fallidos: ${newAttempts.count}/${this.MAX_ATTEMPTS}`);
    } catch (error) {
      console.error('Error incrementando intentos:', error);
    }
  }

  private static getLoginAttempts(): { count: number; timestamp: number } {
    try {
      const attemptsStr = localStorage.getItem('login_attempts');
      if (!attemptsStr) return { count: 0, timestamp: 0 };
      
      return JSON.parse(attemptsStr);
    } catch (error) {
      return { count: 0, timestamp: 0 };
    }
  }

  private static clearLoginAttempts(): void {
    try {
      localStorage.removeItem('login_attempts');
    } catch (error) {
      console.error('Error limpiando intentos:', error);
    }
  }

  private static isLockedOut(): boolean {
    try {
      const attempts = this.getLoginAttempts();
      
      if (attempts.count >= this.MAX_ATTEMPTS) {
        const timeSinceLastAttempt = Date.now() - attempts.timestamp;
        if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
          return true;
        } else {
          // El bloqueo expiró, limpiar intentos
          this.clearLoginAttempts();
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando bloqueo:', error);
      return false;
    }
  }

  // 🔄 Renovar token (para implementar después)
  static async refreshToken(): Promise<boolean> {
    // TODO: Implementar renovación de token
    console.log('🔄 Renovación de token no implementada aún');
    return false;
  }

  // 🧹 Limpiar intentos fallidos manualmente (para debugging)
  static clearLoginAttempts(): void {
    try {
      localStorage.removeItem('login_attempts');
      console.log('🧹 Intentos de login limpiados manualmente');
    } catch (error) {
      console.error('Error limpiando intentos:', error);
    }
  }
}

export default AuthService;