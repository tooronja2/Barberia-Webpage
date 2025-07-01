// 🧪 Página de prueba para Supabase
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TestSupabase: React.FC = () => {
  const [status, setStatus] = useState('🔄 Cargando...');
  const [servicios, setServicios] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('🔄 Probando conexión con Supabase...');

      // Test 1: Servicios
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios')
        .select('*')
        .limit(5);

      if (serviciosError) throw serviciosError;

      // Test 2: Usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, usuario, nombre, rol')
        .limit(5);

      if (usuariosError) throw usuariosError;

      setServicios(serviciosData || []);
      setUsuarios(usuariosData || []);
      setStatus('✅ Supabase conectado correctamente!');

    } catch (error: any) {
      console.error('❌ Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🚀 Barbería Estilo - Test Supabase</h1>
      
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Estado de Conexión:</h2>
        <p style={{ fontSize: '18px' }}>{status}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Variables de Entorno:</h3>
        <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ NO CONFIGURADA'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}</p>
      </div>

      {servicios.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>💇‍♂️ Servicios Encontrados ({servicios.length}):</h3>
          <ul>
            {servicios.map((servicio) => (
              <li key={servicio.id}>
                <strong>{servicio.nombre}</strong> - ${servicio.precio} ({servicio.duracion_minutos} min)
              </li>
            ))}
          </ul>
        </div>
      )}

      {usuarios.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>👥 Usuarios Encontrados ({usuarios.length}):</h3>
          <ul>
            {usuarios.map((usuario) => (
              <li key={usuario.id}>
                <strong>{usuario.nombre}</strong> (@{usuario.usuario}) - {usuario.rol}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>🔗 Enlaces:</h3>
        <p>
          <a href="/" style={{ marginRight: '15px' }}>🏠 Página Principal</a>
          <a href="/gestion" style={{ marginRight: '15px' }}>⚙️ Panel Admin</a>
          <a href="/reservar-turno">📅 Reservar Turno</a>
        </p>
      </div>

      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        🔄 Probar Conexión Nuevamente
      </button>
    </div>
  );
};

export default TestSupabase;