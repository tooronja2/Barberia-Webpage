# 🚀 INSTRUCCIONES PARA VERCEL

## 📋 **PASOS PARA DEPLOY CON SUPABASE:**

### **1. Configurar Variables de Entorno en Vercel:**

En el dashboard de Vercel → Settings → Environment Variables, agregar:

```
VITE_SUPABASE_URL = https://ojinohzftbljrvptnwxe.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaW5vaHpmdGJsanJ2cHRud3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU0NDQsImV4cCI6MjA2Njk2MTQ0NH0.9R1KVSBAmQBgIUXMTP0SRe2NgLBaq3rrk0G_ySH5spE
```

### **2. Asegurar que el SQL se ejecutó en Supabase:**

- Ve a: https://ojinohzftbljrvptnwxe.supabase.co
- SQL Editor → Nueva Query
- Copiar TODO el contenido de `supabase-schema.sql`
- Ejecutar → Debe mostrar "MIGRACIÓN COMPLETADA"

### **3. URLs para probar en Vercel:**

Una vez deployado, probar estas URLs:

#### **🧪 Página de Prueba:**
```
https://tu-vercel-url.vercel.app/test-supabase
```
**Debe mostrar:**
- ✅ "Supabase conectado correctamente!"
- Lista de 7 servicios
- Lista de 5 usuarios
- Variables de entorno configuradas

#### **🔐 Panel Admin:**
```
https://tu-vercel-url.vercel.app/gestion
```
**Usuarios de prueba:**
- `tomasradeljakadmin` / `totomax1` (Administrador)
- `matiasbarbero` / `matiasbarbero` (Barbero)
- `hectormedina` / `hectormedina` (Empleado)

#### **📅 Reservar Turno:**
```
https://tu-vercel-url.vercel.app/reservar-turno
```

### **4. Verificar Funcionamiento:**

#### **✅ Test Básico:**
1. Ir a `/test-supabase`
2. Debe cargar sin errores
3. Mostrar servicios y usuarios
4. Estado: "Supabase conectado correctamente!"

#### **✅ Test Login:**
1. Ir a `/gestion`
2. Login con `tomasradeljakadmin` / `totomax1`
3. Debe entrar al panel admin
4. Ver turnos, usuarios, etc.

#### **✅ Test Reserva:**
1. Ir a `/reservar-turno`
2. Seleccionar servicio
3. Elegir fecha y hora
4. Completar datos
5. Confirmar reserva → Debe aparecer en base de datos

### **5. Si hay Errores:**

#### **Error de Variables:**
- Verificar en Vercel → Settings → Environment Variables
- Deben estar ambas configuradas
- Redeploy después de configurar

#### **Error de Base de Datos:**
- Verificar que ejecutaste el SQL en Supabase
- Ir a Table Editor → Debe ver 6 tablas
- Verificar que hay datos en `usuarios` y `servicios`

#### **Error 404:**
- Verificar que `vercel.json` tiene la configuración de rewrites
- Redeploy si es necesario

### **6. Funcionalidades Disponibles:**

#### **🏠 Página Principal (`/`):**
- Landing page de la barbería
- Navegación a servicios, equipo, etc.

#### **⚙️ Panel Admin (`/gestion`):**
- Login con usuarios de Supabase
- Gestión de turnos en tiempo real
- CRUD de usuarios
- Estadísticas y reportes

#### **📅 Reserva de Turnos (`/reservar-turno`):**
- Selección de servicios desde Supabase
- Calendario con disponibilidad real
- Validación de superposición automática
- Confirmación por email (si configurado)

#### **🧪 Página de Debug (`/test-supabase`):**
- Estado de conexión con Supabase
- Lista de servicios y usuarios
- Variables de entorno
- Botón para re-testear

---

## 🎯 **RESULTADO ESPERADO:**

**Una vez deployado en Vercel, tendrás:**

- ✅ **Aplicación funcionando** con Supabase como backend
- ✅ **Login seguro** con JWT tokens reales
- ✅ **Base de datos PostgreSQL** enterprise-grade
- ✅ **Real-time updates** en turnos
- ✅ **Validación automática** de superposiciones
- ✅ **Panel admin completo** para gestión

**Tu barbería tendrá un sistema más potente que la mayoría de empresas grandes.** 🏆

---

## 🆘 **Soporte:**

Si algo no funciona:

1. **Revisar `/test-supabase`** primero
2. **Verificar variables** de entorno en Vercel
3. **Confirmar SQL ejecutado** en Supabase
4. **Revisar console** del navegador para errores
5. **Redeploy** si es necesario

**¡El sistema está listo para producción!** 🚀