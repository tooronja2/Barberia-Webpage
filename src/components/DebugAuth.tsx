<<<<<<< HEAD
// 🔧 Componente temporal para debugging de autenticación con Supabase
import React from 'react';
import { Button } from '@/components/ui/button';
import AuthServiceSimple from '@/services/authServiceSimple';
import SupabaseService from '@/services/supabaseService';

const DebugAuth: React.FC = () => {
  
  const handleClearAttempts = () => {
    localStorage.removeItem('login_attempts');
    alert('Intentos de login limpiados. Recarga la página.');
  };

  const handleTestSupabase = async () => {
    try {
      console.log('🔧 Testing Supabase connection...');
      
      const result = await SupabaseService.getServicios();
      
      console.log('✅ Supabase Response:', result);
      alert(`Supabase Status: ${result.success ? 'OK - ' + result.count + ' servicios' : 'ERROR'}`);
    } catch (error) {
      console.error('❌ Supabase Error:', error);
      alert('Error conectando con Supabase');
    }
  };

  const handleTestLogin = async () => {
    try {
      console.log('🔐 Testing login with Supabase...');
      
      const testUsers = [
        { user: 'tomasradeljakadmin', pass: 'totomax1' },
        { user: 'matiasbarbero', pass: 'matiasbarbero' },
        { user: 'hectormedina', pass: 'hectormedina' }
      ];

      for (const { user, pass } of testUsers) {
        console.log(`🔍 Probando con Supabase: ${user}`);
        
        try {
          const result = await AuthServiceSimple.login(user, pass);
          console.log(`📝 Resultado Supabase para ${user}:`, result);
          
          if (result.success) {
            alert(`✅ Login Supabase exitoso con: ${user}`);
            return;
          }
        } catch (error) {
          console.error(`❌ Error Supabase para ${user}:`, error);
        }
      }
      
      alert('❌ Ningún usuario funcionó con Supabase');
    } catch (error) {
      console.error('❌ Error en test login:', error);
      alert('Error en test de login');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow-lg z-50">
      <h3 className="font-bold mb-2">🚀 Debug Supabase</h3>
      <div className="space-y-2">
        <Button onClick={handleClearAttempts} size="sm" variant="outline">
          🧹 Limpiar Intentos
        </Button>
        <Button onClick={handleTestSupabase} size="sm" variant="outline">
          🚀 Test Supabase
        </Button>
        <Button onClick={handleTestLogin} size="sm" variant="outline">
          🔐 Test Login
        </Button>
      </div>
    </div>
  );
};

=======
// 🔧 Componente temporal para debugging de autenticación
import React from 'react';
import { Button } from '@/components/ui/button';
import AuthService from '@/services/authService';

const DebugAuth: React.FC = () => {
  
  const handleClearAttempts = () => {
    AuthService.clearLoginAttempts();
    alert('Intentos de login limpiados. Recarga la página.');
  };

  const handleTestAPI = async () => {
    try {
      const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      const API_KEY = import.meta.env.VITE_API_SECRET_KEY;
      
      console.log('🔧 Testing API:', API_URL);
      
      const response = await fetch(`${API_URL}?action=getEventos&apiKey=${API_KEY}&timestamp=${Date.now()}`);
      const data = await response.json();
      
      console.log('✅ API Response:', data);
      alert(`API Status: ${data.success ? 'OK' : 'ERROR'}`);
    } catch (error) {
      console.error('❌ API Error:', error);
      alert('Error conectando con API');
    }
  };

  const handleTestLogin = async () => {
    try {
      console.log('🔐 Testing login with debug info...');
      
      // Probar con diferentes usuarios
      const testUsers = [
        { user: 'tomasradeljakadmin', pass: 'totomax1' },
        { user: 'matiasbarbero', pass: 'matiasbarbero' },
        { user: 'hectormedina', pass: 'hectormedina' }
      ];

      for (const { user, pass } of testUsers) {
        console.log(`🔍 Probando: ${user}`);
        const result = await AuthService.login(user, pass);
        console.log(`📝 Resultado para ${user}:`, result);
        
        if (result.success) {
          alert(`✅ Login exitoso con: ${user}`);
          return;
        }
      }
      
      alert('❌ Ningún usuario funcionó');
    } catch (error) {
      console.error('❌ Error en test login:', error);
      alert('Error en test de login');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow-lg z-50">
      <h3 className="font-bold mb-2">🔧 Debug Auth</h3>
      <div className="space-y-2">
        <Button onClick={handleClearAttempts} size="sm" variant="outline">
          🧹 Limpiar Intentos
        </Button>
        <Button onClick={handleTestAPI} size="sm" variant="outline">
          🌐 Test API
        </Button>
        <Button onClick={handleTestLogin} size="sm" variant="outline">
          🔐 Test Login
        </Button>
      </div>
    </div>
  );
};

>>>>>>> parent of 85dc351 ( testing)
export default DebugAuth;