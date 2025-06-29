
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// 🔐 API KEY SECRETA - DEBE SER LA MISMA QUE EN CalendarioCustom
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyb5nHyPqN7T-vgx1HdJoQZLHALfWnX4yD-Ps18Qq-fU3t8Mbhku-GekMSvYa1w17EN/exec';

const CancelTurno = () => {
  const [searchParams] = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [turnoData, setTurnoData] = useState<any>(null);
  
  const eventId = searchParams.get('id');

  useEffect(() => {
    if (eventId) {
      cargarDatosTurno();
    }
  }, [eventId]);

  const cargarDatosTurno = async () => {
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getTurno&apiKey=${API_SECRET_KEY}&id=${eventId}`);
      const data = await response.json();
      if (data.success) {
        setTurnoData(data.turno);
      } else {
        setMensaje('Turno no encontrado o ya cancelado');
      }
    } catch (error) {
      setMensaje('Error al cargar datos del turno');
    }
  };

  const cancelarTurno = async () => {
    if (!eventId) return;
    
    setCargando(true);
    
    try {
      // MODIFICADO: Usar FormData consistentemente
      const formData = new URLSearchParams();
      formData.append('action', 'cancelarTurno');
      formData.append('apiKey', API_SECRET_KEY);
      formData.append('eventId', eventId);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setMensaje('✅ Turno cancelado exitosamente. Te enviamos un email de confirmación.');
      } else {
        setMensaje('❌ Error al cancelar el turno: ' + result.error);
      }
    } catch (error) {
      setMensaje('❌ Error al procesar la cancelación');
    } finally {
      setCargando(false);
    }
  };

  if (!eventId) {
    return (
      <main className="max-w-md mx-auto pt-10 text-center bg-dark-DEFAULT text-light-DEFAULT">
        <h1 className="text-2xl font-heading font-bold mb-4">Cancelar Turno</h1>
        <p className="text-burgundy-DEFAULT">ID de turno no válido</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto pt-10 px-4 bg-dark-DEFAULT text-light-DEFAULT">
      <h1 className="text-2xl font-heading font-bold mb-6 text-center">Cancelar Turno</h1>
      
      {mensaje ? (
        <div className="bg-dark-100 rounded-xl p-6 shadow text-center">
          <p className="text-lg text-light-DEFAULT">{mensaje}</p>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="mt-4 bg-gold-DEFAULT text-dark-DEFAULT hover:bg-gold-DEFAULT/90"
          >
            Volver al inicio
          </Button>
        </div>
      ) : turnoData ? (
        <div className="bg-dark-100 rounded-xl p-6 shadow space-y-4">
          <h2 className="text-lg font-heading font-semibold text-center text-light-DEFAULT">Detalles del turno</h2>
          
          <div className="space-y-2 text-sm text-light-100">
            <p><strong>Servicio:</strong> {turnoData.Titulo_Evento}</p>
            <p><strong>Cliente:</strong> {turnoData.Nombre_Cliente}</p>
            <p><strong>Fecha:</strong> {turnoData.Fecha}</p>
            <p><strong>Hora inicio:</strong> {turnoData["Hora Inicio"]}</p>
            <p><strong>Hora fin:</strong> {turnoData["Hora Fin"]}</p>
            <p><strong>Especialista:</strong> {turnoData.Responsable}</p>
            <p><strong>Estado:</strong> {turnoData.Estado}</p>
          </div>

          {turnoData.Estado !== 'Cancelado' ? (
            <div className="text-center space-y-4">
              <p className="text-light-100">¿Estás seguro que querés cancelar este turno?</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1 border-gold-DEFAULT text-gold-DEFAULT hover:bg-gold-DEFAULT hover:text-dark-DEFAULT"
                >
                  No, mantener turno
                </Button>
                <Button 
                  onClick={cancelarTurno}
                  disabled={cargando}
                  variant="destructive"
                  className="flex-1 bg-burgundy-DEFAULT text-light-DEFAULT hover:bg-burgundy-DEFAULT/90"
                >
                  {cargando ? 'Cancelando...' : 'Sí, cancelar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-burgundy-DEFAULT">Este turno ya fue cancelado</p>
              <Button onClick={() => window.location.href = '/'} className="mt-4 bg-gold-DEFAULT text-dark-DEFAULT hover:bg-gold-DEFAULT/90">
                Volver al inicio
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-light-DEFAULT">
          <p>Cargando datos del turno...</p>
        </div>
      )}
    </main>
  );
};

export default CancelTurno;
