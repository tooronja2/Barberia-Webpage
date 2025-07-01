// 🧪 Test App para verificar Supabase
import React from 'react';

const TestApp: React.FC = () => {
  const testSupabase = async () => {
    try {
      console.log('🧪 Testing Supabase...');
      
      // Test básico de importación
      const { supabase } = await import('./lib/supabase');
      console.log('✅ Supabase imported successfully');
      
      // Test de conexión
      const { data, error } = await supabase
        .from('servicios')
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('❌ Supabase error:', error);
        alert('Error: ' + error.message);
      } else {
        console.log('✅ Supabase connected:', data);
        alert('Supabase conectado correctamente!');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>🧪 Test Barbería Supabase</h1>
      <p>Aplicación de prueba para verificar la conexión con Supabase</p>
      
      <button 
        onClick={testSupabase}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🚀 Test Supabase Connection
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Variables de entorno:</h3>
        <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'NO CONFIGURADA'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'NO CONFIGURADA'}</p>
      </div>
    </div>
  );
};

export default TestApp;