import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgregarTurno from './AgregarTurno';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import type { Turno } from '@/services/supabaseService';


interface TurnosDiaProps {
  permisos: string[];
  usuario: string;
  rol?: string;
}


const TurnosDia: React.FC<TurnosDiaProps> = ({ permisos, usuario, rol }) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [turnosSinFiltrar, setTurnosSinFiltrar] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [barberosDisponibles, setBarberosDisponibles] = useState<string[]>([]);
  const { toast } = useToast();

  // Función para obtener el barbero asignado al usuario logueado
  const obtenerBarberoAsignadoUsuario = () => {
    try {
      const usuariosGuardados = localStorage.getItem('barberia_usuarios_list');
      if (usuariosGuardados) {
        const usuarios = JSON.parse(usuariosGuardados);
        const usuarioActual = usuarios.find((u: any) => u.usuario === usuario);
        
        if (usuarioActual && usuarioActual.barberoAsignado && usuarioActual.barberoAsignado !== 'todos') {
          console.log('👤 Barbero asignado encontrado en lista:', usuarioActual.barberoAsignado);
          return usuarioActual.barberoAsignado;
        }
      }
      
      console.log('👤 Usuario puede ver todos los barberos');
      return null;
    } catch (error) {
      console.error('Error al obtener barbero asignado:', error);
      return null;
    }
  };


  const obtenerTurnos = async () => {
    setCargando(true);
    setError('');
    try {
      console.log('🔄 Iniciando obtención de turnos...');
      
      const fechaSeleccionada = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const turnosData = await supabaseService.getTurnosPorFecha(fechaSeleccionada);
      
      // Extraer barberos únicos para el filtro
      const responsablesValidos = turnosData
        .map((turno: Turno) => turno.responsable)
        .filter((responsable): responsable is string => 
          typeof responsable === 'string' && responsable.trim() !== ''
        );
      const barberosUnicos: string[] = [...new Set(responsablesValidos)];
      setBarberosDisponibles(barberosUnicos);

      // Guardar turnos sin filtrar por barbero para estadísticas
      setTurnosSinFiltrar(turnosData);

      // Aplicar filtros según el rol y barbero seleccionado
      let turnosFiltrados = turnosData;

      // Si el usuario es empleado y tiene barbero asignado específico
      const barberoAsignado = obtenerBarberoAsignadoUsuario();
      if (rol === 'Empleado' && barberoAsignado) {
        turnosFiltrados = turnosData.filter((turno: Turno) => turno.responsable === barberoAsignado);
      }
      // Si el usuario es barbero y ha seleccionado un barbero específico
      else if (rol === 'Barbero' && barberoSeleccionado !== 'todos') {
        turnosFiltrados = turnosData.filter((turno: Turno) => turno.responsable === barberoSeleccionado);
      }

      turnosFiltrados.sort((a: Turno, b: Turno) => a.horaInicio.localeCompare(b.horaInicio));
      
      setTurnos(turnosFiltrados);
      console.log('✅ Turnos cargados exitosamente:', turnosFiltrados.length);
      
    } catch (e) {
      console.error("❌ Error completo al obtener los turnos:", e);
      const errorMessage = e instanceof Error ? e.message : 'Error de conexión al cargar los turnos';
      
      setError(errorMessage);
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  const cancelarTurno = async (turnoId: string) => {
    try {
      console.log('🔄 Cancelando turno:', turnoId);
      
      await supabaseService.actualizarEstadoTurno(turnoId, 'Cancelado');
      
      setTurnos(prevTurnos =>
        prevTurnos.map(turno =>
          turno.id === turnoId ? { ...turno, estado: 'Cancelado' } : turno
        )
      );
      
      toast({
        title: "Turno cancelado",
        description: "El turno se ha cancelado correctamente.",
      });

    } catch (error) {
      console.error('❌ Error completo al cancelar el turno:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cancelar el turno';
      
      setError(errorMessage);
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const calcularEstadisticas = () => {
    // Las estadísticas ahora siempre se basan en la lista 'turnos', que ya está filtrada.
    const turnosParaEstadisticas = turnos;

    const confirmados = turnosParaEstadisticas.filter(t => t.estado === 'Confirmado').length;
    const completados = turnosParaEstadisticas.filter(t => t.estado === 'Completado').length;
    const cancelados = turnosParaEstadisticas.filter(t => t.estado === 'Cancelado').length;

    const totalIngresosDia = turnosParaEstadisticas
      .filter(t => t.estado === 'Reservado' || t.estado === 'Confirmado')
      .reduce((sum, t) => sum + (t.valor || 0), 0);

    return {
      totalTurnos: turnosParaEstadisticas.length,
      confirmados,
      completados,
      cancelados,
      ingresosDia: totalIngresosDia
    };
  };

  const renderEstadisticasAdmin = () => {
    const stats = calcularEstadisticas();
    const barberoAsignado = obtenerBarberoAsignadoUsuario();
    const filtroLabel = barberoSeleccionado === 'todos' ? '(Todos los barberos)' : `(${barberoSeleccionado})`;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-800">Confirmados</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-green-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-green-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.confirmados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800">Cancelados</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-red-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-red-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-indigo-800">Ingresos del Día</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-indigo-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-indigo-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">${stats.ingresosDia.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    if (estado === 'Reservado') {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    } else if (estado === 'Completado') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (estado === 'Cancelado') {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else if (estado === 'Cliente Ausente') {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  // Actualizar turnos cuando cambie la fecha o el barbero seleccionado
  useEffect(() => {
    obtenerTurnos();
  }, [date, barberoSeleccionado]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Cargando turnos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error: {error}</div>
        <Button 
          onClick={obtenerTurnos} 
          className="mt-2" 
          size="sm"
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(permisos.includes('admin') || rol === 'Barbero') && renderEstadisticasAdmin()}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Turnos del Día</h2>
          {obtenerBarberoAsignadoUsuario() && rol === 'Empleado' && (
            <p className="text-sm text-gray-600">Barbero: {obtenerBarberoAsignadoUsuario()}</p>
          )}
          {rol === 'Barbero' && barberoSeleccionado !== 'todos' && (
            <p className="text-sm text-gray-600">Filtrando por: {barberoSeleccionado}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filtro por barbero solo para usuarios con rol "Barbero" */}
          {rol === 'Barbero' && barberosDisponibles.length > 0 && (
            <Select value={barberoSeleccionado} onValueChange={setBarberoSeleccionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por barbero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los barberos</SelectItem>
                {barberosDisponibles.map((barbero) => (
                  <SelectItem key={barbero} value={barbero}>
                    {barbero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                📅 {date ? date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {turnos.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-500">No hay turnos para esta fecha</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {turnos.map((turno) => (
            <Card key={turno.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-mono text-lg">{turno.horaInicio} - {turno.horaFin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{turno.nombre}</p>
                    <p className="text-sm text-green-600 font-medium">${turno.valor.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Servicio</p>
                    <p className="font-medium">{turno.servicio}</p>
                    <p className="text-sm text-gray-600">{turno.responsable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={getEstadoBadge(turno.estado)}>
                      {turno.estado}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 md:flex-col lg:flex-row">
                  {(turno.estado === 'Reservado' || turno.estado === 'Confirmado') && (
                    <Button
                      onClick={() => cancelarTurno(turno.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 flex-1 md:flex-none"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mostrarAgregarTurno && (
        <AgregarTurno
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => {
            obtenerTurnos();
            setMostrarAgregarTurno(false);
          }}
          fechaSeleccionada={date || new Date()}
        />
      )}
    </div>
  );
};

export default TurnosDia;