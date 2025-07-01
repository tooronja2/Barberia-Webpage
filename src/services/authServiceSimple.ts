// 🔐 Servicio de Autenticación Simple para debugging
import { supabase } from '@/lib/supabase'

interface LoginResponse {
  success: boolean
  data?: any
  error?: string
}

class AuthServiceSimple {
  // 🔐 Login básico
  static async login(emailOrUsername: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Login simple con Supabase...')

      // Por ahora, usar validación directa con la tabla usuarios
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`email.eq.${emailOrUsername},usuario.eq.${emailOrUsername}`)
        .eq('activo', true)
        .single()

      if (error || !usuarios) {
        console.log('❌ Usuario no encontrado:', error)
        return {
          success: false,
          error: 'Usuario no encontrado'
        }
      }

      // TODO: Verificar contraseña (por ahora aceptar cualquiera para testing)
      console.log('✅ Usuario encontrado:', usuarios.nombre)

      return {
        success: true,
        data: {
          usuario: usuarios
        }
      }
    } catch (error) {
      console.error('❌ Error en login simple:', error)
      return {
        success: false,
        error: 'Error de conexión'
      }
    }
  }

  // 🔓 Logout simple
  static async logout(): Promise<void> {
    localStorage.removeItem('barberia_supabase_session')
    console.log('✅ Logout simple')
  }

  // 🔍 Verificar si está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = localStorage.getItem('barberia_supabase_session')
      return !!session
    } catch {
      return false
    }
  }

  // 📋 Usuario actual
  static async getCurrentUser(): Promise<any> {
    try {
      const sessionStr = localStorage.getItem('barberia_supabase_session')
      if (!sessionStr) return null
      
      const session = JSON.parse(sessionStr)
      return session.usuario
    } catch {
      return null
    }
  }

  // 🛡️ Verificar permisos
  static async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false
    
    const permisos = user.permisos || []
    return permisos.includes(permission) || permisos.includes('admin') || user.rol === 'Administrador'
  }

  // 🔧 Es admin
  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.rol === 'Administrador'
  }

  // Dummy para compatibilidad
  static onAuthStateChange(callback: any) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

export default AuthServiceSimple