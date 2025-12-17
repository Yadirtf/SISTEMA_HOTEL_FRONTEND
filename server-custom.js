// Servidor personalizado para Next.js que maneja el proxy de API
// Este servidor funciona con Next.js en modo standalone
const { createServer } = require('http');
const { parse } = require('url');

// En modo standalone, Next.js ya está compilado, así que necesitamos usar el servidor standalone
// Intentar cargar el servidor standalone primero, si no existe, usar next normal
let handle;
let app;

try {
  // Intentar usar el servidor standalone de Next.js
  const standaloneServer = require('./server.js');
  // Si el servidor standalone exporta un handler, usarlo
  if (typeof standaloneServer === 'function') {
    handle = standaloneServer;
  } else {
    // Si no, usar next normal
    const next = require('next');
    const dev = false; // En producción siempre es false
    const hostname = process.env.HOSTNAME || '0.0.0.0';
    const port = parseInt(process.env.PORT || '3000', 10);
    app = next({ dev, hostname, port });
    handle = app.getRequestHandler();
    app.prepare();
  }
} catch (e) {
  // Si no existe server.js, usar next normal
  const next = require('next');
  const dev = false;
  const hostname = process.env.HOSTNAME || '0.0.0.0';
  const port = parseInt(process.env.PORT || '3000', 10);
  app = next({ dev, hostname, port });
  handle = app.getRequestHandler();
  app.prepare();
}

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Interceptar peticiones a /api/* y hacer proxy al backend
      if (pathname && pathname.startsWith('/api/')) {
        console.error('[Custom Server] ==========================================');
        console.error('[Custom Server] API request:', pathname);
        console.error('[Custom Server] Method:', req.method);
        console.error('[Custom Server] Backend URL:', BACKEND_URL);

        try {
          // Construir la URL del backend
          const apiPath = pathname.replace('/api', '');
          const backendUrl = `${BACKEND_URL}${apiPath}${parsedUrl.search || ''}`;
          
          console.error('[Custom Server] Proxying to:', backendUrl);

          // Leer el body si existe
          let body = '';
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            req.on('data', chunk => {
              body += chunk.toString();
            });
            
            await new Promise((resolve) => {
              req.on('end', resolve);
            });
            
            console.error('[Custom Server] Body:', body.substring(0, 200));
          }

          // Hacer la petición al backend usando http/https nativo
          const http = require('http');
          const https = require('https');
          const { URL } = require('url');
          
          const backendUrlObj = new URL(backendUrl);
          const client = backendUrlObj.protocol === 'https:' ? https : http;
          
          const proxyReq = client.request({
            hostname: backendUrlObj.hostname,
            port: backendUrlObj.port || (backendUrlObj.protocol === 'https:' ? 443 : 80),
            path: backendUrlObj.pathname + backendUrlObj.search,
            method: req.method,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(Object.entries(req.headers).filter(([key]) => 
                !['host', 'connection', 'content-length'].includes(key.toLowerCase())
              )),
            },
          }, (proxyRes) => {
            let responseData = '';
            proxyRes.on('data', chunk => {
              responseData += chunk.toString();
            });
            
            proxyRes.on('end', () => {
              console.error('[Custom Server] Backend response status:', proxyRes.statusCode);
              
              let jsonData;
              try {
                jsonData = JSON.parse(responseData);
              } catch {
                jsonData = responseData;
              }
              
              console.error('[Custom Server] Backend response:', JSON.stringify(jsonData, null, 2).substring(0, 500));
              
              // Enviar la respuesta al cliente
              res.writeHead(proxyRes.statusCode || 500, {
                'Content-Type': 'application/json',
                ...Object.fromEntries(Object.entries(proxyRes.headers).filter(([key]) => 
                  !['connection', 'transfer-encoding'].includes(key.toLowerCase())
                )),
              });
              res.end(JSON.stringify(jsonData));
            });
          });
          
          proxyReq.on('error', (error) => {
            console.error('[Custom Server] Proxy request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: error.message || 'Error al comunicarse con el backend',
              data: null
            }));
          });
          
          if (body) {
            proxyReq.write(body);
          }
          proxyReq.end();
          return;
        } catch (error) {
          console.error('[Custom Server] ==========================================');
          console.error('[Custom Server] ERROR en proxy:', error);
          console.error('[Custom Server] Error name:', error.name);
          console.error('[Custom Server] Error message:', error.message);
          console.error('[Custom Server] Error stack:', error.stack);
          console.error('[Custom Server] ==========================================');

          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: error.message || 'Error al comunicarse con el backend',
            data: null
          }));
          return;
        }
      }

      // Para todas las demás peticiones, usar el handler de Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

