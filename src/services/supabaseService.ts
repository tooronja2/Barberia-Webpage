// 🚀 Servicio Principal de Supabase - Reemplaza Google Sheets
import { supabase } from '@/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

// 📋 TIPOS DE DATOS
export interface Usuario {
  id: string
  email: string
  usuario: string
  nombre: string
  rol: 'Administrador' | 'Barbero' | 'Empleado'
  permisos: string[]
  barbero_asignado?: string
  activo: boolean
  created_at: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  precio_oferta?: number
  duracion_minutos: number
  categoria: string
  activo: boolean
  color: string
  imagen_url?: string
}

export interface Turno {
  id: string
  id_evento: string
  titulo_evento: string
  servicio_id?: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  duracion_minutos: number
  descripcion?: string
  responsable: string
  estado: 'Confirmado' | 'Cancelado' | 'Completado' | 'No_Show'
  precio: number
  servicios_incluidos?: string
  notas_internas?: string
  created_at: string
}

export interface HorarioEspecialista {
  id: string
  especialista: string
  dia_semana: number // 0=Domingo, 6=Sábado
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface DiaLibre {
  id: string
  especialista?: string
  fecha: string
  motivo?: string
  todo_el_dia: boolean
  hora_inicio?: string
  hora_fin?: string
  activo: boolean
}

// 🔄 RESPUESTA ESTÁNDAR
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

class SupabaseService {
  
  // 🔐 AUTENTICACIÓN
  static async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      // Primero intentar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authData.user && !authError) {
        // Obtener datos adicionales del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single()

        if (userData && !userError) {
          return {
            success: true,
            data: {
              user: authData.user,
              session: authData.session,
              usuario: userData
            }
          }
        }
      }

      // Fallback: autenticación legacy usando tabla usuarios
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', email)
        .eq('activo', true)
        .single()

      if (error || !usuario) {
        return {
          success: false,
          error: 'Usuario o contraseña incorrectos'
        }
      }

      // TODO: Implementar verificación de contraseña hash
      console.log('⚠️ Usando autenticación legacy sin hash')
      
      return {
        success: true,
        data: {
          usuario: usuario,
          token: `legacy_${Date.now()}` // Token temporal
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      return {
        success: false,
        error: 'Error de conexión'
      }
    }
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error en logout:', error)
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // 👥 GESTIÓN DE USUARIOS
  static async getUsuarios(): Promise<ApiResponse<Usuario[]>> {
    try {
      const { data, error, count } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  static async crearUsuario(userData: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Error creando usuario:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // 💇‍♂️ GESTIÓN DE SERVICIOS
  static async getServicios(): Promise<ApiResponse<Servicio[]>> {
    try {
      const { data, error, count } = await supabase
        .from('servicios')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count
      }
    } catch (error) {
      console.error('❌ Error obteniendo servicios:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // 📅 GESTIÓN DE TURNOS
  static async getTurnos(filters?: {
    fecha?: string
    responsable?: string
    estado?: string
  }): Promise<ApiResponse<Turno[]>> {
    try {
      let query = supabase
        .from('turnos')
        .select(`
          *,
          servicios(nombre, categoria, color)
        `, { count: 'exact' })

      // Aplicar filtros
      if (filters?.fecha) {
        query = query.eq('fecha', filters.fecha)
      }
      if (filters?.responsable) {
        query = query.eq('responsable', filters.responsable)
      }
      if (filters?.estado) {
        query = query.eq('estado', filters.estado)
      }

      const { data, error, count } = await query
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count
      }
    } catch (error) {
      console.error('❌ Error obteniendo turnos:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  static async crearTurno(turnoData: Partial<Turno>): Promise<ApiResponse<Turno>> {
    try {
      // Generar ID único para compatibilidad
      const id_evento = `evento_${Date.now()}`
      
      const turnoCompleto = {
        ...turnoData,
        id_evento,
        estado: 'Confirmado' as const
      }

      const { data, error } = await supabase
        .from('turnos')
        .insert([turnoCompleto])
        .select()
        .single()

      if (error) throw error

      // TODO: Enviar email de confirmación
      console.log('✅ Turno creado:', data.id_evento)

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Error creando turno:', error)
      
      // Manejar error de superposición
      if ((error as any).message?.includes('superposición')) {
        return {
          success: false,
          error: 'Ya existe un turno en ese horario para el especialista'
        }
      }

      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  static async cancelarTurno(turnoId: string, motivo?: string): Promise<ApiResponse<Turno>> {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .update({
          estado: 'Cancelado' as const,
          cancelled_at: new Date().toISOString(),
          notas_internas: motivo
        })
        .eq('id_evento', turnoId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Turno cancelado:', turnoId)

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Error cancelando turno:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // ⏰ GESTIÓN DE HORARIOS
  static async getHorarios(): Promise<ApiResponse<HorarioEspecialista[]>> {
    try {
      const { data, error, count } = await supabase
        .from('horarios_especialistas')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .order('especialista')
        .order('dia_semana')
        .order('hora_inicio')

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count
      }
    } catch (error) {
      console.error('❌ Error obteniendo horarios:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // 🚫 GESTIÓN DE DÍAS LIBRES
  static async getDiasLibres(): Promise<ApiResponse<DiaLibre[]>> {
    try {
      const { data, error, count } = await supabase
        .from('dias_libres')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .order('fecha', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count
      }
    } catch (error) {
      console.error('❌ Error obteniendo días libres:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // 🎯 OBTENER SLOTS DISPONIBLES
  static async getSlotsDisponibles(
    especialista: string,
    fecha: string,
    duracion: number = 15
  ): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .rpc('obtener_slots_disponibles', {
          p_especialista: especialista,
          p_fecha: fecha,
          p_duracion: duracion
        })

      if (error) throw error

      // Convertir TIME a string HH:MM
      const slots = (data || []).map((slot: any) => slot.hora_slot)

      return {
        success: true,
        data: slots
      }
    } catch (error) {
      console.error('❌ Error obteniendo slots:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }

  // 🔄 SUSCRIPCIONES EN TIEMPO REAL
  static subscribeToTurnos(callback: (payload: any) => void) {
    return supabase
      .channel('turnos_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'turnos'
      }, callback)
      .subscribe()
  }

  static subscribeToUsuarios(callback: (payload: any) => void) {
    return supabase
      .channel('usuarios_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'usuarios'
      }, callback)
      .subscribe()
  }

  // 📊 ESTADÍSTICAS Y REPORTES
  static async getEstadisticas(fechaInicio: string, fechaFin: string) {
    try {
      const { data: turnos, error } = await supabase
        .from('turnos')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .neq('estado', 'Cancelado')

      if (error) throw error

      const stats = {
        total_turnos: turnos?.length || 0,
        ingresos_total: turnos?.reduce((sum, t) => sum + (t.precio || 0), 0) || 0,
        por_especialista: {},
        por_servicio: {}
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      return {
        success: false,
        error: (error as PostgrestError).message
      }
    }
  }
}

export default SupabaseService

// 🔥 MIGRACIÓN DESDE GOOGLE SHEETS
export async function migrarDesdeGoogleSheets() {
  console.log('🔄 Iniciando migración desde Google Sheets...')
  // TODO: Implementar migración automática de datos existentes
  console.log('⚠️ Migración manual requerida por ahora')
}