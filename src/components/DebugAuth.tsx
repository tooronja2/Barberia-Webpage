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
      
      // Probar con diferentes usuarios usando fetch directo
      const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      const API_KEY = import.meta.env.VITE_API_SECRET_KEY;
      
      const testUsers = [
        { user: 'tomasradeljakadmin', pass: 'totomax1' },
        { user: 'matiasbarbero', pass: 'matiasbarbero' },
        { user: 'hectormedina', pass: 'hectormedina' }
      ];

      for (const { user, pass } of testUsers) {
        console.log(`🔍 Probando directo con API: ${user}`);
        
        // Test directo con la API antigua para ver si funciona
        try {
          const formData = new URLSearchParams();
          formData.append('action', 'validarLogin');
          formData.append('usuario', user);
          formData.append('password', pass);
          formData.append('apiKey', API_KEY);

          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
          });

          const data = await response.json();
          console.log(`📝 Respuesta API para ${user}:`, data);
          
          if (data.success) {
            alert(`✅ Login exitoso con: ${user}`);
            return;
          }
        } catch (error) {
          console.error(`❌ Error API para ${user}:`, error);
        }
      }
      
      alert('❌ Ningún usuario funcionó con API directa');
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

export default DebugAuth;