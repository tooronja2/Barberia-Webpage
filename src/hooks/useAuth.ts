// 🔐 Hook personalizado para manejo de autenticación
import { useState, useEffect, useCallback } from 'react';
import AuthService from '@/services/authService';

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
    const checkAuth = () => {
      try {
        const isAuth = AuthService.isAuthenticated();
        const currentUser = AuthService.getCurrentUser();
        
        setAuthState({
          isAuthenticated: isAuth,
          user: currentUser ? {
            nombre: currentUser.usuario,
            rol: currentUser.rol,
            permisos: currentUser.permisos,
            barberoAsignado: currentUser.barberoAsignado
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
      
      const result = await AuthService.login(usuario, password);
      
      if (result.success && result.usuario) {
        setAuthState({
          isAuthenticated: true,
          user: {
            nombre: result.usuario.nombre,
            rol: result.usuario.rol,
            permisos: result.usuario.permisos,
            barberoAsignado: result.usuario.barberoAsignado
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
  const logout = useCallback(() => {
    AuthService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  }, []);

  // Verificar permisos
  const hasPermission = useCallback((permission: string): boolean => {
    return AuthService.hasPermission(permission);
  }, []);

  // Verificar si es admin
  const isAdmin = useCallback((): boolean => {
    return authState.user?.rol === 'Administrador' || 
           authState.user?.permisos.includes('admin') || false;
  }, [authState.user]);

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    isAdmin
  };
};

export default useAuth;