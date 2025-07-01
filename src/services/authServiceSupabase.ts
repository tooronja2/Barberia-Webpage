// 🔐 Servicio de Autenticación con Supabase - SUPER SEGURO
import { supabase } from '@/lib/supabase'
import SupabaseService from './supabaseService'

interface LoginResponse {
  success: boolean
  data?: {
    user: any
    session?: any
    usuario: any
  }
  error?: string
}

interface SessionData {
  user: any
  usuario: any
  token?: string
  expiresAt: number
}

class AuthServiceSupabase {
  private static readonly STORAGE_KEY = 'barberia_supabase_session'

  // 🔐 Login con Supabase (REAL + Legacy support)
  static async login(emailOrUsername: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Iniciando login con Supabase...')

      // Usar SupabaseService que maneja tanto auth real como legacy
      const result = await SupabaseService.login(emailOrUsername, password)
      
      if (result.success && result.data) {
        // Guardar sesión
        this.saveSession({
          user: result.data.user || null,
          usuario: result.data.usuario,
          token: result.data.session?.access_token || result.data.token,
          expiresAt: Date.now() + 86400000 // 24 horas
        })

        console.log('✅ Login Supabase exitoso')
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Credenciales incorrectas'
        }
      }
    } catch (error) {
      console.error('❌ Error en login Supabase:', error)
      return {
        success: false,
        error: 'Error de conexión'
      }
    }
  }

  // 🔓 Logout
  static async logout(): Promise<void> {
    try {
      await SupabaseService.logout()
      localStorage.removeItem(this.STORAGE_KEY)
      
      // Limpiar también storage legacy
      localStorage.removeItem('barberia_session')
      localStorage.removeItem('barberia_usuario')
      localStorage.removeItem('barberia_rol')
      localStorage.removeItem('barberia_permisos')
      localStorage.removeItem('barberia_barbero_asignado')
      
      console.log('✅ Logout exitoso')
    } catch (error) {
      console.error('Error en logout:', error)
    }
  }

  // 🔍 Verificar autenticación
  static async isAuthenticated(): Promise<boolean> {
    try {
      // Verificar sesión de Supabase Auth
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return true

      // Fallback: verificar sesión legacy
      const session = this.getSession()
      if (!session) return false
      
      if (Date.now() > session.expiresAt) {
        console.log('⏰ Sesión expirada')
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      return false
    }
  }

  // 📋 Obtener usuario actual
  static async getCurrentUser(): Promise<any> {
    try {
      // Intentar obtener de Supabase Auth primero
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Obtener datos completos del usuario
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .single()

        return userData
      }

      // Fallback: sesión legacy
      const session = this.getSession()
      if (!session || !this.isAuthenticated()) {
        return null
      }
      return session.usuario
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error)
      return null
    }
  }

  // 🛡️ Verificar permisos
  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false
      
      const permisos = Array.isArray(user.permisos) ? user.permisos : []
      return permisos.includes(permission) || permisos.includes('admin') || user.rol === 'Administrador'
    } catch (error) {
      console.error('Error verificando permisos:', error)
      return false
    }
  }

  // 🔧 Verificar si es admin
  static async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user?.rol === 'Administrador' || (user?.permisos || []).includes('admin')
    } catch (error) {
      return false
    }
  }

  // 💾 Guardar sesión local
  private static saveSession(session: SessionData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Error guardando sesión:', error)
    }
  }

  // 📖 Obtener sesión local
  private static getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionStr) return null
      
      return JSON.parse(sessionStr)
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  }

  // 🔄 Renovar token
  static async refreshToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) return false

      // Actualizar sesión local
      const currentSession = this.getSession()
      if (currentSession) {
        this.saveSession({
          ...currentSession,
          token: data.session.access_token,
          expiresAt: Date.now() + 86400000
        })
      }

      return true
    } catch (error) {
      console.error('Error renovando token:', error)
      return false
    }
  }

  // 📧 Registrar nuevo usuario (solo admins)
  static async register(userData: {
    email: string
    password: string
    nombre: string
    usuario: string
    rol?: string
    permisos?: string[]
  }): Promise<LoginResponse> {
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      })

      if (authError) throw authError

      // Crear registro en tabla usuarios
      const usuarioData = {
        email: userData.email,
        usuario: userData.usuario,
        nombre: userData.nombre,
        rol: userData.rol || 'Empleado',
        permisos: userData.permisos || ['ver_turnos'],
        activo: true
      }

      const result = await SupabaseService.crearUsuario(usuarioData)
      
      if (result.success) {
        console.log('✅ Usuario registrado exitosamente')
        return {
          success: true,
          data: {
            user: authData.user,
            usuario: result.data
          }
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error registrando usuario:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al registrar usuario'
      }
    }
  }

  // 🔒 Cambiar contraseña
  static async changePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      console.log('✅ Contraseña actualizada')
      return true
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error)
      return false
    }
  }

  // 📱 Suscribirse a cambios de autenticación
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default AuthServiceSupabase