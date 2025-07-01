import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Shield } from 'lucide-react';
import AuthServiceSupabase from '@/services/authServiceSupabase';
import DebugAuth from '@/components/DebugAuth';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string, permisos: string[]) => void;
}

// 🔒 Login SEGURO - Usando AuthService
// NO más credenciales hardcodeadas

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [precargando, setPrecargando] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(3);

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      if (await AuthServiceSupabase.isAuthenticated()) {
        const user = await AuthServiceSupabase.getCurrentUser();
        if (user) {
          console.log('✅ Usuario ya autenticado');
          onLogin(user.nombre, user.rol, user.permisos || []);
        }
      }
    };
    checkAuth();
  }, [onLogin]);

  // 🚫 ELIMINADO: limpiarDatosUsuario - Ya no se necesita
  // AuthService maneja toda la lógica de forma segura

  // 🚫 ELIMINADO: validarUsuarioEnGoogleSheets - ERA INSEGURO
  // AuthService.login() maneja todo de forma segura

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    console.log('🔒 Iniciando login SEGURO...');
    
    try {
      // 🚀 Usar Supabase - MÁXIMO NIVEL DE SEGURIDAD
      const resultado = await AuthServiceSupabase.login(usuario, password);
      
      if (resultado.success && resultado.data) {
        const userData = resultado.data.usuario;
        console.log('✅ Login SUPABASE exitoso');
        onLogin(userData.nombre, userData.rol, userData.permisos || []);
      } else {
        console.log('❌ Login SUPABASE fallido:', resultado.error);
        setError(resultado.error || 'Credenciales incorrectas');
        
        // Actualizar intentos restantes
        const remainingAttempts = Math.max(0, intentosRestantes - 1);
        setIntentosRestantes(remainingAttempts);
        
        if (remainingAttempts === 0) {
          setError('Cuenta bloqueada por seguridad. Intenta en 15 minutos.');
        }
      }
    } catch (error) {
      console.error('❌ Error en login SUPABASE:', error);
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl font-bold">Barbería Estilo</CardTitle>
          </div>
          <p className="text-gray-600">Sistema SUPABASE v5.0</p>
          <p className="text-xs text-green-600">🚀 PostgreSQL + JWT Real</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                {intentosRestantes > 0 && (
                  <p className="text-xs mt-1 text-gray-500">
                    Intentos restantes: {intentosRestantes}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={cargando || intentosRestantes === 0}>
              <Shield className="mr-2 h-4 w-4" />
              {cargando ? 'Conectando con Supabase...' : 'Iniciar Sesión SUPABASE'}
            </Button>
            
            <div className="text-center text-xs text-green-600 mt-2">
              <p>🚀 Base de datos PostgreSQL</p>
              <p>🔐 JWT Tokens + RLS Security</p>
              <p>⚡ Real-time Updates</p>
            </div>
          </form>
        </CardContent>
      </Card>
      <DebugAuth />
    </div>
  );
};

export default LoginBarberia;
