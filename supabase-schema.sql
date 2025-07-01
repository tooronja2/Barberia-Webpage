-- 🏗️ ESQUEMA COMPLETO BARBERÍA ESTILO - SUPABASE
-- Migración desde Google Sheets manteniendo TODAS las funcionalidades
-- Ejecutar en Supabase SQL Editor

-- 🧹 Limpiar tablas existentes (opcional)
DROP TABLE IF EXISTS public.logs_actividad CASCADE;
DROP TABLE IF EXISTS public.turnos CASCADE;
DROP TABLE IF EXISTS public.dias_libres CASCADE;
DROP TABLE IF EXISTS public.horarios_especialistas CASCADE;
DROP TABLE IF EXISTS public.servicios CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 🚫 Deshabilitar RLS temporalmente para setup
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM anon, authenticated;

-- 👥 TABLA USUARIOS
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Null para usuarios que usan Supabase Auth
    usuario TEXT UNIQUE NOT NULL, -- Campo legacy para compatibilidad
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Empleado' CHECK (rol IN ('Administrador', 'Barbero', 'Empleado')),
    permisos JSONB NOT NULL DEFAULT '["ver_turnos"]'::jsonb,
    barbero_asignado TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 💇‍♂️ TABLA SERVICIOS
CREATE TABLE public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    duracion_minutos INTEGER NOT NULL DEFAULT 15,
    categoria TEXT DEFAULT 'General',
    activo BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#facc15', -- Color para UI
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ⏰ TABLA HORARIOS DE ESPECIALISTAS
CREATE TABLE public.horarios_especialistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    especialista TEXT NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(especialista, dia_semana, hora_inicio, hora_fin)
);

-- 🚫 TABLA DÍAS LIBRES/FERIADOS
CREATE TABLE public.dias_libres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    especialista TEXT, -- NULL = todos los especialistas
    fecha DATE NOT NULL,
    motivo TEXT,
    todo_el_dia BOOLEAN DEFAULT true,
    hora_inicio TIME,
    hora_fin TIME,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 📅 TABLA TURNOS (principal)
CREATE TABLE public.turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento TEXT UNIQUE NOT NULL, -- Compatibilidad con Google Sheets
    titulo_evento TEXT NOT NULL,
    servicio_id UUID REFERENCES public.servicios(id),
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    cliente_telefono TEXT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL DEFAULT 15,
    descripcion TEXT,
    responsable TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Confirmado' CHECK (estado IN ('Confirmado', 'Cancelado', 'Completado', 'No_Show')),
    precio DECIMAL(10,2) NOT NULL,
    servicios_incluidos TEXT,
    notas_internas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by TEXT
);

-- 📊 TABLA LOGS DE ACTIVIDAD
CREATE TABLE public.logs_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id),
    accion TEXT NOT NULL,
    tabla_afectada TEXT,
    registro_id TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🚀 ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_turnos_fecha ON public.turnos(fecha);
CREATE INDEX idx_turnos_responsable ON public.turnos(responsable);
CREATE INDEX idx_turnos_estado ON public.turnos(estado);
CREATE INDEX idx_turnos_cliente_email ON public.turnos(cliente_email);
CREATE INDEX idx_horarios_especialista ON public.horarios_especialistas(especialista);
CREATE INDEX idx_horarios_dia ON public.horarios_especialistas(dia_semana);
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_activo ON public.usuarios(activo);
CREATE INDEX idx_servicios_activo ON public.servicios(activo);

-- 🔄 TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON public.horarios_especialistas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_turnos_updated_at BEFORE UPDATE ON public.turnos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dias_libres_updated_at BEFORE UPDATE ON public.dias_libres FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🔒 FUNCIÓN PARA VALIDAR SUPERPOSICIÓN DE TURNOS
CREATE OR REPLACE FUNCTION validar_superposicion_turnos()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si hay turnos superpuestos para el mismo especialista
    IF EXISTS (
        SELECT 1 FROM public.turnos 
        WHERE responsable = NEW.responsable 
        AND fecha = NEW.fecha 
        AND estado IN ('Confirmado', 'Completado')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (hora_inicio < NEW.hora_fin AND hora_fin > NEW.hora_inicio)
        )
    ) THEN
        RAISE EXCEPTION 'Ya existe un turno en ese horario para el especialista %', NEW.responsable;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_superposicion 
    BEFORE INSERT OR UPDATE ON public.turnos 
    FOR EACH ROW EXECUTE FUNCTION validar_superposicion_turnos();

-- 📊 FUNCIÓN PARA LOGS AUTOMÁTICOS
CREATE OR REPLACE FUNCTION log_cambios()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.logs_actividad (
        accion, 
        tabla_afectada, 
        registro_id, 
        datos_anteriores, 
        datos_nuevos
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar logs a tablas importantes
CREATE TRIGGER log_usuarios AFTER INSERT OR UPDATE OR DELETE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION log_cambios();
CREATE TRIGGER log_turnos AFTER INSERT OR UPDATE OR DELETE ON public.turnos FOR EACH ROW EXECUTE FUNCTION log_cambios();

-- 🗂️ INSERTAR DATOS INICIALES

-- Servicios basados en tu aplicación actual
INSERT INTO public.servicios (nombre, descripcion, precio, precio_oferta, duracion_minutos, categoria) VALUES
('Corte de barba', 'Corte y arreglo de barba profesional', 6500, NULL, 15, 'Barba'),
('Corte de pelo', 'Corte de pelo clásico y moderno', 8500, NULL, 15, 'Cabello'),
('Corte todo maquina', 'Corte completo con máquina', 8000, NULL, 15, 'Cabello'),
('Corte de pelo y barba', 'Servicio completo de pelo y barba', 9500, NULL, 25, 'Completo'),
('Diseños y dibujos', 'Diseños creativos en cabello', 6500, NULL, 20, 'Especial'),
('Lavado y peinado', 'Lavado profesional y peinado', 5000, NULL, 10, 'Cabello'),
('Tratamiento capilar', 'Tratamiento nutritivo para el cabello', 12000, NULL, 30, 'Tratamiento');

-- Especialistas basados en tu sistema actual
INSERT INTO public.usuarios (usuario, nombre, email, rol, permisos, barbero_asignado) VALUES
('tomasradeljakadmin', 'Tomas Radeljak', 'tomas.radeljak@gmail.com', 'Administrador', '["admin", "crear_usuarios", "ver_todos", "eliminar"]', ''),
('matiasbarbero', 'Matias Barbero', 'matias@barberia.com', 'Barbero', '["ver_turnos", "agregar_turnos"]', ''),
('hectormedina', 'Héctor Medina', 'hector@barberia.com', 'Empleado', '["ver_turnos", "agregar_turnos"]', 'Héctor Medina'),
('lucasperalta', 'Lucas Peralta', 'lucas@barberia.com', 'Barbero', '["ver_turnos", "agregar_turnos"]', 'Lucas Peralta'),
('camila', 'Camila González', 'camila@barberia.com', 'Barbero', '["ver_turnos", "agregar_turnos"]', 'Camila González');

-- Horarios de trabajo estándar (Lunes a Sábado, 9:00 a 18:00)
INSERT INTO public.horarios_especialistas (especialista, dia_semana, hora_inicio, hora_fin) VALUES
-- Lucas Peralta
('Lucas Peralta', 1, '09:00', '18:00'), -- Lunes
('Lucas Peralta', 2, '09:00', '18:00'), -- Martes
('Lucas Peralta', 3, '09:00', '18:00'), -- Miércoles
('Lucas Peralta', 4, '09:00', '18:00'), -- Jueves
('Lucas Peralta', 5, '09:00', '18:00'), -- Viernes
('Lucas Peralta', 6, '09:00', '18:00'), -- Sábado

-- Héctor Medina
('Héctor Medina', 1, '09:00', '18:00'),
('Héctor Medina', 2, '09:00', '18:00'),
('Héctor Medina', 3, '09:00', '18:00'),
('Héctor Medina', 4, '09:00', '18:00'),
('Héctor Medina', 5, '09:00', '18:00'),
('Héctor Medina', 6, '09:00', '18:00'),

-- Camila González
('Camila González', 1, '09:00', '18:00'),
('Camila González', 2, '09:00', '18:00'),
('Camila González', 3, '09:00', '18:00'),
('Camila González', 4, '09:00', '18:00'),
('Camila González', 5, '09:00', '18:00'),
('Camila González', 6, '09:00', '18:00');

-- 🔐 CONFIGURAR ROW LEVEL SECURITY (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_especialistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dias_libres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_actividad ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Los usuarios pueden ver su propia información" ON public.usuarios FOR SELECT USING (auth.uid()::text = id::text OR rol = 'Administrador');
CREATE POLICY "Solo administradores pueden insertar usuarios" ON public.usuarios FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));
CREATE POLICY "Solo administradores pueden actualizar usuarios" ON public.usuarios FOR UPDATE USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- Políticas para SERVICIOS (lectura pública, escritura admin)
CREATE POLICY "Los servicios son visibles para todos" ON public.servicios FOR SELECT USING (activo = true);
CREATE POLICY "Solo administradores pueden modificar servicios" ON public.servicios FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- Políticas para HORARIOS (lectura pública, escritura admin)
CREATE POLICY "Los horarios son visibles para todos" ON public.horarios_especialistas FOR SELECT USING (activo = true);
CREATE POLICY "Solo administradores pueden modificar horarios" ON public.horarios_especialistas FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- Políticas para TURNOS
CREATE POLICY "Los turnos son visibles para empleados autenticados" ON public.turnos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Los empleados pueden crear turnos" ON public.turnos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Los empleados pueden actualizar turnos" ON public.turnos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Solo administradores pueden eliminar turnos" ON public.turnos FOR DELETE USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- Políticas para DÍAS LIBRES
CREATE POLICY "Los días libres son visibles para todos" ON public.dias_libres FOR SELECT USING (activo = true);
CREATE POLICY "Solo administradores pueden gestionar días libres" ON public.dias_libres FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- Políticas para LOGS (solo administradores)
CREATE POLICY "Solo administradores pueden ver logs" ON public.logs_actividad FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id::text = auth.uid()::text AND rol = 'Administrador'));

-- 🎯 VISTAS ÚTILES

-- Vista de turnos con información completa
CREATE VIEW vista_turnos_completos AS
SELECT 
    t.*,
    s.nombre as servicio_nombre,
    s.categoria as servicio_categoria,
    s.color as servicio_color,
    EXTRACT(DOW FROM t.fecha) as dia_semana,
    TO_CHAR(t.fecha, 'DD/MM/YYYY') as fecha_formato,
    TO_CHAR(t.hora_inicio, 'HH24:MI') as hora_formato
FROM public.turnos t
LEFT JOIN public.servicios s ON t.servicio_id = s.id
WHERE t.estado != 'Cancelado'
ORDER BY t.fecha DESC, t.hora_inicio ASC;

-- Vista de disponibilidad de especialistas
CREATE VIEW vista_disponibilidad_especialistas AS
SELECT 
    h.especialista,
    h.dia_semana,
    h.hora_inicio,
    h.hora_fin,
    CASE h.dia_semana 
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia_nombre
FROM public.horarios_especialistas h
WHERE h.activo = true
ORDER BY h.especialista, h.dia_semana, h.hora_inicio;

-- 📊 FUNCIÓN PARA OBTENER SLOTS DISPONIBLES
CREATE OR REPLACE FUNCTION obtener_slots_disponibles(
    p_especialista TEXT,
    p_fecha DATE,
    p_duracion INTEGER DEFAULT 15
)
RETURNS TABLE(hora_slot TIME) AS $$
DECLARE
    horario RECORD;
    slot_time TIME;
    slot_end TIME;
BEGIN
    -- Obtener horario del especialista para el día
    SELECT hora_inicio, hora_fin INTO horario
    FROM public.horarios_especialistas 
    WHERE especialista = p_especialista 
    AND dia_semana = EXTRACT(DOW FROM p_fecha)
    AND activo = true
    LIMIT 1;
    
    -- Si no hay horario, no devolver slots
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Verificar si es día libre
    IF EXISTS (
        SELECT 1 FROM public.dias_libres 
        WHERE (especialista = p_especialista OR especialista IS NULL)
        AND fecha = p_fecha 
        AND activo = true
    ) THEN
        RETURN;
    END IF;
    
    -- Generar slots cada 15 minutos
    slot_time := horario.hora_inicio;
    
    WHILE slot_time < horario.hora_fin LOOP
        slot_end := slot_time + (p_duracion || ' minutes')::INTERVAL;
        
        -- Verificar que el slot completo esté dentro del horario
        IF slot_end <= horario.hora_fin THEN
            -- Verificar que no haya turno reservado
            IF NOT EXISTS (
                SELECT 1 FROM public.turnos 
                WHERE responsable = p_especialista 
                AND fecha = p_fecha 
                AND estado IN ('Confirmado', 'Completado')
                AND hora_inicio < slot_end::TIME
                AND hora_fin > slot_time
            ) THEN
                hora_slot := slot_time;
                RETURN NEXT;
            END IF;
        END IF;
        
        slot_time := slot_time + '15 minutes'::INTERVAL;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ✅ MIGRACIÓN COMPLETADA
COMMENT ON SCHEMA public IS '🚀 Barbería Estilo - Base de datos migrada desde Google Sheets con mejoras de seguridad y performance';

-- 📝 Mostrar resumen
SELECT 
    'MIGRACIÓN COMPLETADA' as status,
    (SELECT COUNT(*) FROM public.usuarios) as usuarios_creados,
    (SELECT COUNT(*) FROM public.servicios) as servicios_creados,
    (SELECT COUNT(*) FROM public.horarios_especialistas) as horarios_creados;