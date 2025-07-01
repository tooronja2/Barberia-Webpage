// Servicio optimizado para Google Sheets con cache y retry logic
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyb5nHyPqN7T-vgx1HdJoQZLHALfWnX4yD-Ps18Qq-fU3t8Mbhku-GekMSvYa1w17EN/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

// Configuración de cache
const CACHE_DURATION = {
  usuarios: 5 * 60 * 1000, // 5 minutos
  eventos: 2 * 60 * 1000,  // 2 minutos
  horarios: 10 * 60 * 1000 // 10 minutos
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class GoogleSheetsCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(keyPattern?: string): void {
    if (keyPattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Limpieza automática de cache expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del cache
const cache = new GoogleSheetsCache();

// Limpieza automática cada 5 minutos
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Función optimizada para hacer requests con timeout y retry
async function makeOptimizedRequest(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 8000,
  maxRetries: number = 2
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers
    }
  };

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt + 1}/${maxRetries + 1} para: ${url.split('?')[0]}`);
      
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Intento ${attempt + 1} falló:`, error);
      
      // No reintentar en último intento
      if (attempt < maxRetries) {
        // Espera exponencial: 500ms, 1000ms, 2000ms
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  clearTimeout(timeoutId);
  throw lastError;
}

// Servicio principal
export class GoogleSheetsService {
  
  // Obtener usuarios con cache
  static async getUsuarios(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'usuarios';
    
    if (!forceRefresh) {
      const cached = cache.get<any[]>(cacheKey);
      if (cached) {
        console.log('✅ Usuarios obtenidos del cache');
        return cached;
      }
    }

    try {
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getUsuarios&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      const response = await makeOptimizedRequest(url, { method: 'GET' }, 6000, 1);
      const data = await response.json();

      if (data.success && data.usuarios) {
        cache.set(cacheKey, data.usuarios, CACHE_DURATION.usuarios);
        console.log('✅ Usuarios obtenidos y cacheados');
        return data.usuarios;
      } else {
        throw new Error(data.error || 'Error al obtener usuarios');
      }
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      
      // Intentar devolver cache expirado como fallback
      const expiredCache = cache.get<any[]>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Usando cache expirado como fallback');
        return expiredCache;
      }
      
      throw error;
    }
  }

  // Obtener eventos con cache
  static async getEventos(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'eventos';
    
    if (!forceRefresh) {
      const cached = cache.get<any[]>(cacheKey);
      if (cached) {
        console.log('✅ Eventos obtenidos del cache');
        return cached;
      }
    }

    try {
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      const response = await makeOptimizedRequest(url, { method: 'GET' }, 7000, 2);
      const data = await response.json();

      if (data.success && data.eventos) {
        // Procesar eventos
        const eventosProcesados = data.eventos.map((evento: any) => {
          let fechaNormalizada = evento.Fecha;
          if (typeof evento.Fecha === 'object' && evento.Fecha instanceof Date) {
            fechaNormalizada = evento.Fecha.toISOString().split('T')[0];
          } else if (typeof evento.Fecha === 'string' && evento.Fecha.includes('T')) {
            fechaNormalizada = evento.Fecha.split('T')[0];
          }
          return { ...evento, Fecha: fechaNormalizada };
        });

        cache.set(cacheKey, eventosProcesados, CACHE_DURATION.eventos);
        console.log('✅ Eventos obtenidos y cacheados');
        return eventosProcesados;
      } else {
        throw new Error(data.error || 'Error al obtener eventos');
      }
    } catch (error) {
      console.error('❌ Error al obtener eventos:', error);
      
      // Intentar devolver cache expirado como fallback
      const expiredCache = cache.get<any[]>(cacheKey);
      if (expiredCache) {
        console.log('🔄 Usando cache expirado como fallback');
        return expiredCache;
      }
      
      throw error;
    }
  }

  // Crear reserva con retry optimizado
  static async crearReserva(reservaData: any): Promise<any> {
    try {
      const datos = {
        action: "crearReserva",
        apiKey: API_SECRET_KEY,
        data: JSON.stringify(reservaData)
      };

      const formData = new URLSearchParams();
      for (const key in datos) {
        formData.append(key, datos[key]);
      }

      const response = await makeOptimizedRequest(
        GOOGLE_APPS_SCRIPT_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        },
        10000, // 10 segundos para creación
        1 // Solo 1 retry para evitar duplicados
      );

      const result = await response.json();
      
      if (result.success) {
        // Limpiar cache de eventos para refrescar disponibilidad
        cache.clear('eventos');
        console.log('✅ Reserva creada exitosamente');
        return result;
      } else {
        throw new Error(result.error || 'Error al crear reserva');
      }
    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      throw error;
    }
  }

  // Validar usuario optimizado
  static async validarUsuario(usuario: string, password: string): Promise<any> {
    try {
      console.log('🔐 Validando usuario optimizado...');
      
      const usuarios = await this.getUsuarios();
      
      // Procesar usuarios (mismo logic que antes pero con datos cacheados)
      const usuariosProcesados = usuarios.map(user => {
        const limpiarPropiedad = (valor: any) => {
          return typeof valor === 'string' ? valor.trim() : valor;
        };

        let permisos = [];
        try {
          const permisosRaw = user.permisos || user['permisos '] || '[]';
          permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
          if (!Array.isArray(permisos)) permisos = ['ver_turnos'];
        } catch (error) {
          permisos = ['ver_turnos'];
        }

        return {
          id: String(user.id || ''),
          usuario: limpiarPropiedad(user.usuario || user['usuario '] || ''),
          password: limpiarPropiedad(user.password || user['password '] || ''),
          nombre: limpiarPropiedad(user.nombre || user['nombre '] || ''),
          rol: limpiarPropiedad(user.rol || user['rol '] || 'Empleado'),
          permisos: permisos,
          barberoAsignado: limpiarPropiedad(user.barberoAsignado || user['barberoAsignado '] || '')
        };
      });
      
      const usuarioEncontrado = usuariosProcesados.find(u => 
        u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === password
      );
      
      if (usuarioEncontrado) {
        console.log('✅ Usuario validado desde cache/optimizado');
        return { valido: true, usuario: usuarioEncontrado };
      } else {
        return { valido: false, error: 'Usuario o contraseña incorrectos' };
      }
    } catch (error) {
      console.error('❌ Error al validar usuario:', error);
      return { valido: false, error: 'Error de conexión al validar usuario' };
    }
  }

  // Limpiar cache manualmente
  static clearCache(pattern?: string): void {
    cache.clear(pattern);
  }

  // Precarga de datos en background
  static async preloadData(): Promise<void> {
    try {
      console.log('🔄 Precargando datos en background...');
      
      // Cargar usuarios y eventos de forma paralela
      await Promise.allSettled([
        this.getUsuarios(),
        this.getEventos()
      ]);
      
      console.log('✅ Datos precargados exitosamente');
    } catch (error) {
      console.log('⚠️ Error en precarga (no crítico):', error);
    }
  }
}

// Auto-precargar datos al cargar el módulo
GoogleSheetsService.preloadData();