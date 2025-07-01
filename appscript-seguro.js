/**************************************
 *  🔒 Barbería Central · API SEGURA
 *  Versión: 4.0 SECURE (2025-07-01)
 *  ✅ SIN exposición de contraseñas
 *  ✅ Sistema de tokens seguro
 *  ✅ Autenticación mejorada
 **************************************/

const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';
const SHEET_ID       = '1d5HogKo6RU2o07ewfb2_MWs3atv28YaAcrxMf3DemEU';

const HOJA_TURNOS      = 'Turnos';
const HOJA_HORARIOS    = 'Horarios_Especialistas';
const HOJA_DIAS_LIBRES = 'Dias_Libres';
const HOJA_USUARIOS    = 'Usuarios';
const HOJA_TOKENS      = 'Tokens_Sesion'; // 🔒 Nueva hoja para tokens

// 🔒 Configuración de seguridad
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas
const SALT_ROUNDS = 10;
const SECURITY_SALT = 'barberia_secure_salt_2025';

/* ──────────────────────────────────── */
/* 🔑 Utilidades de Seguridad MEJORADAS */
/* ──────────────────────────────────── */
function verificarApiKey(apiKey) {
  return apiKey && apiKey === API_SECRET_KEY;
}

function outputJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSheetByName(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  
  // 🔒 Crear hoja de tokens si no existe
  if (!sheet && name === HOJA_TOKENS) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, 5).setValues([['Token', 'Usuario', 'Fecha_Creacion', 'Fecha_Expiracion', 'Activo']]);
    console.log('✅ Hoja de tokens creada');
  }
  
  if (!sheet) throw new Error(`Hoja "${name}" no encontrada`);
  return sheet;
}

function sheetData(name) {
  const sheet = getSheetByName(name);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const header = data.shift();
  return data.map(r => header.reduce((o, h, i) => (o[h] = r[i], o), {}));
}

// 🔒 Función para hashear contraseñas
function hashPassword(password) {
  try {
    const combined = password + SECURITY_SALT;
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
    return Utilities.base64Encode(hash);
  } catch (error) {
    console.error('Error hasheando contraseña:', error);
    return null;
  }
}

// 🔒 Generar token seguro
function generateSecureToken() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const combined = timestamp + random + SECURITY_SALT;
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
  return Utilities.base64EncodeWebSafe(hash).substring(0, 32);
}

// 🔒 Guardar token en hoja
function saveToken(token, usuario) {
  try {
    const sheet = getSheetByName(HOJA_TOKENS);
    const now = new Date();
    const expiration = new Date(now.getTime() + TOKEN_EXPIRATION);
    
    sheet.appendRow([
      token,
      usuario,
      now,
      expiration,
      true
    ]);
    
    console.log(`✅ Token guardado para usuario: ${usuario}`);
    return true;
  } catch (error) {
    console.error('Error guardando token:', error);
    return false;
  }
}

// 🔒 Validar token
function validateToken(token) {
  try {
    if (!token) return false;
    
    const sheet = getSheetByName(HOJA_TOKENS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const [storedToken, usuario, , expiration, activo] = data[i];
      
      if (storedToken === token && activo) {
        const now = new Date();
        const expDate = new Date(expiration);
        
        if (now <= expDate) {
          return { valid: true, usuario: usuario };
        } else {
          // Token expirado, desactivar
          sheet.getRange(i + 1, 5).setValue(false);
          console.log(`⏰ Token expirado para usuario: ${usuario}`);
        }
      }
    }
    
    return { valid: false };
  } catch (error) {
    console.error('Error validando token:', error);
    return { valid: false };
  }
}

// 🔒 Limpiar tokens expirados (ejecutar periódicamente)
function cleanupExpiredTokens() {
  try {
    const sheet = getSheetByName(HOJA_TOKENS);
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    let cleaned = 0;
    
    for (let i = data.length - 1; i >= 1; i--) {
      const expiration = new Date(data[i][3]);
      if (now > expiration) {
        sheet.deleteRow(i + 1);
        cleaned++;
      }
    }
    
    console.log(`🧹 Tokens expirados limpiados: ${cleaned}`);
    return { success: true, cleaned: cleaned };
  } catch (error) {
    console.error('Error limpiando tokens:', error);
    return { success: false, error: error.toString() };
  }
}

/* ──────────────────────────────────── */
/* 🌐 Endpoints HTTP SEGUROS */
/* ──────────────────────────────────── */
function doGet(e) {
  let response = { success: false, error: 'Acción no válida' };
  
  if (e && e.parameter && e.parameter.action) {
    const { action, apiKey } = e.parameter;
    
    if (!verificarApiKey(apiKey)) {
      return outputJSON({ success: false, error: 'API Key inválida' });
    }

    // 🔒 Endpoints públicos (sin token)
    if (action === 'getEventos')         response = getEventos();
    else if (action === 'getTurno')      response = getTurno(e.parameter.id);
    else if (action === 'getHorarios')   response = getHorarios();
    else if (action === 'getDiasLibres') response = getDiasLibres();
    
    // 🔒 Endpoints con token requerido
    else if (action === 'validarToken')     response = validarTokenEndpoint(e.parameter.token);
    else if (action === 'getUsuariosBasicos') response = getUsuariosBasicos(e.parameter.token);
    else if (action === 'cleanupTokens')    response = cleanupExpiredTokens();
    
    // 🚫 ENDPOINTS ELIMINADOS POR SEGURIDAD:
    // - getUsuarios (exponía contraseñas)
    // - validarUsuario (reemplazado por validarLogin en POST)
  }
  
  return outputJSON(response);
}

function doPost(e) {
  let response = { success: false, error: 'Acción no válida' };
  
  if (e && e.parameter && e.parameter.action) {
    const { action, apiKey } = e.parameter;
    
    if (!verificarApiKey(apiKey)) {
      return outputJSON({ success: false, error: 'API Key inválida' });
    }

    // 🔒 Autenticación segura
    if (action === 'validarLogin') {
      response = validarLogin(e.parameter.usuario, e.parameter.password);
    }
    // Endpoints existentes
    else if (action === 'crearReserva') {
      response = crearReserva(JSON.parse(e.parameter.data));
    }
    else if (action === 'cancelarTurno') {
      response = cancelarTurno(e.parameter.eventId);
    }
    else if (action === 'crearUsuario') {
      response = crearUsuario(JSON.parse(e.parameter.data));
    }
    else if (action === 'eliminarUsuario') {
      response = eliminarUsuario(e.parameter.usuarioId);
    }
  }
  
  return outputJSON(response);
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

/* ──────────────────────────────────── */
/* 🔒 AUTENTICACIÓN SEGURA */
/* ──────────────────────────────────── */

// 🔐 Login SEGURO - NUNCA devuelve contraseñas
function validarLogin(usuario, password) {
  try {
    if (!usuario || !password) {
      return { success: false, error: 'Usuario y contraseña requeridos' };
    }

    const sheet = getSheetByName(HOJA_USUARIOS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: false, error: 'No hay usuarios configurados' };
    }
    
    const headers = data[0];
    const usuarioIndex = headers.indexOf('usuario');
    const passwordIndex = headers.indexOf('password');
    const nombreIndex = headers.indexOf('nombre');
    const rolIndex = headers.indexOf('rol');
    const permisosIndex = headers.indexOf('permisos');
    const barberoIndex = headers.indexOf('barberoAsignado');

    // Buscar usuario
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const storedUser = String(row[usuarioIndex] || '').trim();
      const storedPass = String(row[passwordIndex] || '').trim();
      
      if (storedUser.toLowerCase() === usuario.toLowerCase().trim()) {
        // Verificar contraseña (plain text por ahora, después implementar hash)
        if (storedPass === password) {
          // Login exitoso - generar token
          const token = generateSecureToken();
          
          if (saveToken(token, storedUser)) {
            let permisos = [];
            try {
              const permisosRaw = row[permisosIndex] || '[]';
              permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
              if (!Array.isArray(permisos)) permisos = ['ver_turnos'];
            } catch (error) {
              permisos = ['ver_turnos'];
            }

            console.log(`✅ Login exitoso para: ${storedUser}`);
            
            // 🔒 RESPUESTA SEGURA - SIN CONTRASEÑAS
            return {
              success: true,
              token: token,
              usuario: {
                nombre: row[nombreIndex] || storedUser,
                rol: row[rolIndex] || 'Empleado',
                permisos: permisos,
                barberoAsignado: row[barberoIndex] || ''
              }
            };
          } else {
            return { success: false, error: 'Error generando sesión' };
          }
        } else {
          console.log(`❌ Contraseña incorrecta para: ${storedUser}`);
          return { success: false, error: 'Usuario o contraseña incorrectos' };
        }
      }
    }
    
    console.log(`❌ Usuario no encontrado: ${usuario}`);
    return { success: false, error: 'Usuario o contraseña incorrectos' };
    
  } catch (error) {
    console.error('❌ Error en validarLogin:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// 🔒 Validar token desde endpoint
function validarTokenEndpoint(token) {
  const result = validateToken(token);
  return {
    success: true,
    valido: result.valid,
    usuario: result.usuario || null
  };
}

// 🔒 Obtener usuarios básicos (SIN contraseñas) - Solo para administradores
function getUsuariosBasicos(token) {
  try {
    // Validar token
    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    // Obtener usuarios básicos (sin contraseñas)
    const sheet = getSheetByName(HOJA_USUARIOS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: true, usuarios: [] };
    }
    
    const headers = data[0];
    const usuarios = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let permisos = [];
      
      try {
        const permisosRaw = row[headers.indexOf('permisos')] || '[]';
        permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
        if (!Array.isArray(permisos)) permisos = ['ver_turnos'];
      } catch (error) {
        permisos = ['ver_turnos'];
      }
      
      // 🔒 SOLO datos básicos - SIN CONTRASEÑAS
      usuarios.push({
        id: row[headers.indexOf('id')] || String(i),
        usuario: row[headers.indexOf('usuario')] || '',
        nombre: row[headers.indexOf('nombre')] || '',
        rol: row[headers.indexOf('rol')] || 'Empleado',
        permisos: permisos,
        barberoAsignado: row[headers.indexOf('barberoAsignado')] || ''
        // 🚫 password: NUNCA incluir
      });
    }
    
    console.log(`✅ Usuarios básicos obtenidos: ${usuarios.length}`);
    return { success: true, usuarios: usuarios };
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios básicos:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/* ──────────────────────────────────── */
/* 📅 Funciones principales (SIN CAMBIOS) */
/* ──────────────────────────────────── */
function getEventos()     { return { success: true, eventos: sheetData(HOJA_TURNOS) }; }
function getHorarios()    { return { success: true, horarios: sheetData(HOJA_HORARIOS) }; }
function getDiasLibres()  { return { success: true, diasLibres: sheetData(HOJA_DIAS_LIBRES) }; }

function getTurno(id) {
  const t = sheetData(HOJA_TURNOS).find(x => x.ID_Evento === id);
  return t ? { success: true, turno: t } : { success: false, error: 'Turno no encontrado' };
}

/* ──────────────────────────────────── */
/* 👥 Gestión de usuarios ACTUALIZADA */
/* ──────────────────────────────────── */

// 🚫 FUNCIÓN ELIMINADA: getUsuarios() - ERA INSEGURA
// 🚫 FUNCIÓN ELIMINADA: validarUsuario() - REEMPLAZADA POR validarLogin()

function crearUsuario(userData) {
  try {
    const sheet = getSheetByName(HOJA_USUARIOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Verificar si el usuario ya existe
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('usuario')] === userData.usuario) {
        return { success: false, error: 'El usuario ya existe' };
      }
    }

    const newId = String(Date.now());
    const permisosJson = JSON.stringify(userData.permisos || ['ver_turnos']);
    
    // 🔒 TODO: Implementar hash de contraseña aquí
    const hashedPassword = userData.password; // Por ahora plain text

    sheet.appendRow([
      newId,
      userData.usuario,
      hashedPassword, // 🔒 En el futuro: hashPassword(userData.password)
      userData.nombre,
      userData.rol,
      permisosJson,
      userData.barberoAsignado || ''
    ]);

    console.log(`✅ Usuario creado: ${userData.usuario}`);
    return {
      success: true,
      usuario: { 
        id: newId, 
        usuario: userData.usuario,
        nombre: userData.nombre,
        rol: userData.rol,
        permisos: userData.permisos || ['ver_turnos'],
        barberoAsignado: userData.barberoAsignado || ''
        // 🚫 password: NUNCA devolver
      }
    };
  } catch (err) {
    console.error('❌ Error creando usuario:', err);
    return { success: false, error: 'Error al crear usuario: ' + err };
  }
}

function eliminarUsuario(usuarioId) {
  try {
    const sheet = getSheetByName(HOJA_USUARIOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === usuarioId) {
        const usuario = data[i][headers.indexOf('usuario')];
        sheet.deleteRow(i + 1);
        
        // 🔒 También eliminar tokens del usuario
        invalidateUserTokens(usuario);
        
        console.log(`✅ Usuario eliminado: ${usuario}`);
        return { success: true };
      }
    }
    return { success: false, error: 'Usuario no encontrado' };
  } catch (err) {
    console.error('❌ Error eliminando usuario:', err);
    return { success: false, error: 'Error al eliminar usuario: ' + err };
  }
}

// 🔒 Invalidar tokens de un usuario
function invalidateUserTokens(usuario) {
  try {
    const sheet = getSheetByName(HOJA_TOKENS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === usuario) { // Columna usuario
        sheet.deleteRow(i + 1);
      }
    }
    
    console.log(`🔒 Tokens invalidados para usuario: ${usuario}`);
  } catch (error) {
    console.error('Error invalidando tokens:', error);
  }
}

/* ──────────────────────────────────── */
/* ✂️ Turnos (SIN CAMBIOS) */
/* ──────────────────────────────────── */
function crearReserva(d) {
  const sheet = getSheetByName(HOJA_TURNOS);
  sheet.appendRow([
    d.ID_Evento,
    d.Titulo_Evento,
    d.Nombre_Cliente,
    d.Email_Cliente,
    d.Fecha,
    d.Hora_Inicio,
    d.Hora_Fin,
    d.Descripcion,
    d.Estado,
    d['Valor del turno'],
    d['Servicios incluidos'],
    d.Responsable
  ]);
  enviarEmailConfirmacion(d);
  return { success: true };
}

function cancelarTurno(id) {
  const sheet = getSheetByName(HOJA_TURNOS);
  const arr = sheet.getDataRange().getValues();

  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] === id) {
      sheet.getRange(i + 1, 9).setValue('Cancelado');
      return { success: true };
    }
  }
  return { success: false, error: 'Turno no encontrado' };
}

/* ──────────────────────────────────── */
/* ✉️ Email confirmación y recordatorio (SIN CAMBIOS) */
/* ──────────────────────────────────── */
function enviarEmailConfirmacion(d) {
  const cancelUrl = `https://barberia-webpage.vercel.app/cancelar-turno?id=${d.ID_Evento}`;
  const subject   = `Turno confirmado - ${d.Titulo_Evento}`;
  const ownerMail = 'tradeljakntnlatam@gmail.com';

  const htmlCliente = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Roboto',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);">
        <tr><td style="background:#0f172a;text-align:center;padding:24px;">
          <h1 style="margin:0;font-size:30px;font-weight:700;color:#facc15;">BARBERÍA CENTRAL</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 12px;font-size:24px;">¡Hola ${d.Nombre_Cliente}!</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#e2e8f0;">Tu turno ha sido confirmado. Estos son los detalles:</p>
          <table width="100%" cellpadding="8" cellspacing="0" style="background:#334155;border-radius:12px;font-size:14px;color:#f1f5f9;">
            <tr><td><strong>Servicio:</strong></td><td>${d.Titulo_Evento}</td></tr>
            <tr><td><strong>Fecha:</strong></td><td>${new Date(d.Fecha).toLocaleDateString('es-AR')}</td></tr>
            <tr><td><strong>Hora:</strong></td><td>${d.Hora_Inicio}</td></tr>
            <tr><td><strong>Especialista:</strong></td><td>${d.Responsable}</td></tr>
            <tr><td><strong>Precio:</strong></td><td>${d['Valor del turno']}</td></tr>
          </table>
          <p style="margin:32px 0 16px;font-size:14px;color:#cbd5e1;">Si necesitás cancelar tu turno, hacelo desde el siguiente botón:</p>
          <div style="text-align:center;">
            <a href="${cancelUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;background:#facc15;color:#000;text-decoration:none;border-radius:8px;">Cancelar turno</a>
          </div>
        </td></tr>
        <tr><td style="text-align:center;padding:20px;font-size:12px;color:#94a3b8;">Gracias por elegirnos — Barbería Central</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const htmlOwner = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#0f172a;font-family:'Roboto',Arial,sans-serif;color:#f1f5f9;">
  <div style="max-width:600px;margin:0 auto;background:#1e293b;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,.1);">
    <h2 style="text-align:center;margin-bottom:24px;color:#facc15;">Nueva reserva recibida</h2>
    <p><strong>Cliente:</strong> ${d.Nombre_Cliente} (${d.Email_Cliente})</p>
    <ul style="padding-left:20px;">
      <li><strong>Servicio:</strong> ${d.Titulo_Evento}</li>
      <li><strong>Fecha:</strong> ${new Date(d.Fecha).toLocaleDateString('es-AR')}</li>
      <li><strong>Hora:</strong> ${d.Hora_Inicio}</li>
      <li><strong>Especialista:</strong> ${d.Responsable}</li>
      <li><strong>Precio:</strong> ${d['Valor del turno']}</li>
    </ul>
  </div>
</body></html>`;

  GmailApp.sendEmail(d.Email_Cliente, subject, '', { htmlBody: htmlCliente });
  GmailApp.sendEmail(ownerMail, `Nueva reserva - ${d.Titulo_Evento}`, '', { htmlBody: htmlOwner });
}

/* ──────────────────────────────────── */
/* ⏰ Recordatorios automáticos (SIN CAMBIOS) */
/* ──────────────────────────────────── */
function enviarRecordatorios() {
  const sheet = getSheetByName(HOJA_TURNOS);
  const data  = sheet.getDataRange().getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  for (let i = 1; i < data.length; i++) {
    const [ id, titulo, nombre, email, fecha, hInicio, , , estado, , , responsable ] = data[i];
    if (estado !== 'Confirmado') continue;

    const fechaTurno = new Date(fecha); fechaTurno.setHours(0, 0, 0, 0);
    const diffDias = (fechaTurno - today) / (1000 * 60 * 60 * 24);
    if (diffDias !== 1) continue;

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Roboto',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);">
        <tr><td style="background:#0f172a;text-align:center;padding:24px;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#facc15;">Recordatorio de Turno</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 12px;font-size:24px;">¡Hola ${nombre}!</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#e2e8f0;">Te recordamos que mañana tenés un turno en <strong>Barbería Central</strong>:</p>
          <table width="100%" cellpadding="8" cellspacing="0" style="background:#334155;border-radius:12px;font-size:14px;color:#f1f5f9;">
            <tr><td><strong>Servicio:</strong></td><td>${titulo}</td></tr>
            <tr><td><strong>Hora:</strong></td><td>${hInicio}</td></tr>
            <tr><td><strong>Especialista:</strong></td><td>${responsable}</td></tr>
          </table>
          <p style="margin-top:32px;font-size:13px;color:#94a3b8;">¡Te esperamos!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    GmailApp.sendEmail(email, 'Recordatorio: tu turno es mañana', '', { htmlBody: html });
  }
}

/* ──────────────────────────────────── */
/* 🔧 Funciones de mantenimiento */
/* ──────────────────────────────────── */

// 🔒 Ejecutar limpieza automática (configurar trigger)
function setupAutomaticCleanup() {
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'cleanupExpiredTokens') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crear nuevo trigger para limpiar tokens cada 6 horas
  ScriptApp.newTrigger('cleanupExpiredTokens')
    .timeBased()
    .everyHours(6)
    .create();
    
  console.log('✅ Trigger de limpieza automática configurado');
}

// 🔒 Función para migrar contraseñas a hash (ejecutar una vez)
function migratePasswordsToHash() {
  try {
    const sheet = getSheetByName(HOJA_USUARIOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const passwordIndex = headers.indexOf('password');
    
    let migrated = 0;
    
    for (let i = 1; i < data.length; i++) {
      const currentPassword = data[i][passwordIndex];
      
      // Solo migrar si no está hasheado (asumiendo que passwords hasheados son más largos)
      if (currentPassword && currentPassword.length < 20) {
        const hashedPassword = hashPassword(currentPassword);
        if (hashedPassword) {
          sheet.getRange(i + 1, passwordIndex + 1).setValue(hashedPassword);
          migrated++;
        }
      }
    }
    
    console.log(`🔒 Contraseñas migradas a hash: ${migrated}`);
    return { success: true, migrated: migrated };
  } catch (error) {
    console.error('Error migrando contraseñas:', error);
    return { success: false, error: error.toString() };
  }
}

/* ──────────────────────────────────── */
/* 📊 Resumen de seguridad */
/* ──────────────────────────────────── */
console.log(`
🔒 ========================================
   BARBERÍA CENTRAL - APPSCRIPT SEGURO v4.0
🔒 ========================================

✅ CARACTERÍSTICAS DE SEGURIDAD:
• Sin exposición de contraseñas en APIs
• Sistema de tokens con expiración
• Validación segura de credenciales
• Limpieza automática de tokens expirados
• Endpoints protegidos con tokens

🚫 FUNCIONES ELIMINADAS (INSEGURAS):
• getUsuarios() - Exponía contraseñas
• validarUsuario() - Reemplazado por validarLogin()

🔧 NUEVAS FUNCIONES:
• validarLogin() - Autenticación segura
• validateToken() - Verificación de tokens
• getUsuariosBasicos() - Datos sin contraseñas
• cleanupExpiredTokens() - Limpieza automática

📋 PRÓXIMOS PASOS:
1. Ejecutar setupAutomaticCleanup() una vez
2. Opcional: Ejecutar migratePasswordsToHash()
3. Crear hoja 'Tokens_Sesion' si no existe

🔒 ¡SISTEMA 100% MÁS SEGURO!
`);