// 🔐 Hook personalizado para manejo de autenticación con Supabase
import { useState, useEffect, useCallback } from 'react';
import AuthServiceSimple from '@/services/authServiceSimple';

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
        const isAuth = await AuthServiceSimple.isAuthenticated();
        const currentUser = await AuthServiceSimple.getCurrentUser();
        
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
  }, []);

  // Login
  const login = useCallback(async (usuario: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await AuthServiceSimple.login(usuario, password);
      
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
    await AuthServiceSimple.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  }, []);

  // Verificar permisos
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    return AuthServiceSimple.hasPermission(permission);
  }, []);

  // Verificar si es admin
  const isAdmin = useCallback(async (): Promise<boolean> => {
    return AuthServiceSimple.isAdmin();
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