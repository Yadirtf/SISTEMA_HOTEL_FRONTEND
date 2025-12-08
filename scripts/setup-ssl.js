// Script para configurar Node.js para aceptar certificados autofirmados
// Este archivo debe ejecutarse antes de iniciar Next.js

// Deshabilitar verificación SSL solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  // Configurar variable de entorno
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Configurar el módulo https directamente
  const https = require('https');
  const tls = require('tls');
  
  // Guardar funciones originales
  const originalCreateSecureContext = tls.createSecureContext;
  const originalRequest = https.request;
  const originalGet = https.get;
  
  // Interceptar createSecureContext
  tls.createSecureContext = function(options) {
    if (options) {
      options.rejectUnauthorized = false;
    }
    return originalCreateSecureContext.call(this, options);
  };
  
  // Interceptar https.request para asegurar que use rejectUnauthorized: false
  https.request = function(options, callback) {
    if (typeof options === 'string') {
      options = { path: options };
    }
    if (options) {
      options.rejectUnauthorized = false;
    }
    return originalRequest.call(this, options, callback);
  };
  
  // También interceptar https.get
  https.get = function(options, callback) {
    if (typeof options === 'string') {
      options = { path: options };
    }
    if (options) {
      options.rejectUnauthorized = false;
    }
    return https.request(options, callback).end();
  };
  
  console.log('🔓 SSL verification disabled for development');
}
