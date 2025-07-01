// 🔐 Hook personalizado para manejo de autenticación con Supabase
import { useState, useEffect, useCallback } from 'react';
import AuthServiceSupabase from '@/services/authServiceSupabase';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    nombre: string;
    rol: string;
    permisos: string[];
    barberoAsignado?: string;
  } | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await AuthServiceSupabase.isAuthenticated();
        const currentUser = await AuthServiceSupabase.getCurrentUser();
        
        setAuthState({
          isAuthenticated: isAuth,
          user: currentUser ? {
            nombre: currentUser.nombre,
            rol: currentUser.rol,
            permisos: currentUser.permisos || [],
            barberoAsignado: currentUser.barbero_asignado
          } : null,
          isLoading: false
        });
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };

    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = AuthServiceSupabase.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          });
        } else if (event === 'SIGNED_IN' && session) {
          await checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(async (usuario: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await AuthServiceSupabase.login(usuario, password);
      
      if (result.success && result.data) {
        const userData = result.data.usuario;
        setAuthState({
          isAuthenticated: true,
          user: {
            nombre: userData.nombre,
            rol: userData.rol,
            permisos: userData.permisos || [],
            barberoAsignado: userData.barbero_asignado
          },
          isLoading: false
        });
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await AuthServiceSupabase.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  }, []);

  // Verificar permisos
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    return AuthServiceSupabase.hasPermission(permission);
  }, []);

  // Verificar si es admin
  const isAdmin = useCallback(async (): Promise<boolean> => {
    return AuthServiceSupabase.isAdmin();
  }, []);

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    isAdmin
  };
};

export default useAuth;