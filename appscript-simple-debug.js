/**************************************
 *  🔧 AppScript DEBUG - Versión Simple
 *  Para verificar que funciona básicamente
 **************************************/

const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';
const SHEET_ID = '1d5HogKo6RU2o07ewfb2_MWs3atv28YaAcrxMf3DemEU';

function outputJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function verificarApiKey(apiKey) {
  return apiKey && apiKey === API_SECRET_KEY;
}

function doGet(e) {
  console.log('🔧 doGet ejecutado con parámetros:', e.parameter);
  
  let response = { success: false, error: 'Acción no válida' };
  
  if (e && e.parameter && e.parameter.action) {
    const { action, apiKey } = e.parameter;
    
    console.log('🔑 Action:', action, 'ApiKey válida:', verificarApiKey(apiKey));
    
    if (!verificarApiKey(apiKey)) {
      return outputJSON({ success: false, error: 'API Key inválida' });
    }

    if (action === 'getEventos') {
      response = { success: true, eventos: [], debug: 'getEventos funcionando' };
    }
    else if (action === 'testDebug') {
      response = { success: true, message: 'AppScript funcionando correctamente', timestamp: new Date() };
    }
  }
  
  console.log('📤 Respuesta enviada:', response);
  return outputJSON(response);
}

function doPost(e) {
  console.log('🔧 doPost ejecutado con parámetros:', e.parameter);
  
  let response = { success: false, error: 'Acción no válida en POST' };
  
  if (e && e.parameter && e.parameter.action) {
    const { action, apiKey, usuario, password } = e.parameter;
    
    console.log('🔑 POST Action:', action, 'Usuario:', usuario);
    
    if (!verificarApiKey(apiKey)) {
      return outputJSON({ success: false, error: 'API Key inválida' });
    }

    if (action === 'validarLogin') {
      console.log('🔐 Validando login para:', usuario);
      
      // Test simple - verificar si es uno de los usuarios conocidos
      const usuariosTest = {
        'tomasradeljakadmin': 'totomax1',
        'matiasbarbero': 'matiasbarbero', 
        'hectormedina': 'hectormedina'
      };
      
      if (usuariosTest[usuario] && usuariosTest[usuario] === password) {
        response = {
          success: true,
          token: 'test_token_' + Date.now(),
          usuario: {
            nombre: usuario,
            rol: usuario === 'tomasradeljakadmin' ? 'Administrador' : 'Empleado',
            permisos: usuario === 'tomasradeljakadmin' ? ['admin'] : ['ver_turnos'],
            barberoAsignado: ''
          }
        };
        console.log('✅ Login exitoso para:', usuario);
      } else {
        response = { success: false, error: 'Usuario o contraseña incorrectos' };
        console.log('❌ Login fallido para:', usuario);
      }
    }
  }
  
  console.log('📤 POST Respuesta enviada:', response);
  return outputJSON(response);
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

console.log('🚀 AppScript DEBUG cargado correctamente');