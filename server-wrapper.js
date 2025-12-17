// Wrapper para el servidor standalone de Next.js que agrega proxy de API
const { createServer } = require('http');
const { parse } = require('url');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Cargar el servidor standalone de Next.js
const standaloneServerPath = path.join(__dirname, 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.error('Error: server.js no encontrado. Asegúrate de que Next.js está en modo standalone.');
  process.exit(1);
}

// Leer y modificar el servidor standalone
let serverCode = fs.readFileSync(standaloneServerPath, 'utf8');

// Crear un servidor HTTP que intercepta /api/* antes de pasarlo a Next.js
createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Interceptar peticiones a /api/* y hacer proxy al backend
    if (pathname && pathname.startsWith('/api/')) {
      console.error('[Server Wrapper] ==========================================');
      console.error('[Server Wrapper] API request:', pathname);
      console.error('[Server Wrapper] Method:', req.method);
      console.error('[Server Wrapper] Backend URL:', BACKEND_URL);

      try {
        // Construir la URL del backend
        const apiPath = pathname.replace('/api', '');
        const backendUrl = `${BACKEND_URL}${apiPath}${parsedUrl.search || ''}`;
        
        console.error('[Server Wrapper] Proxying to:', backendUrl);

        // Leer el body si existe
        let body = '';
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          await new Promise((resolve) => {
            req.on('end', resolve);
          });
          
          console.error('[Server Wrapper] Body:', body.substring(0, 200));
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
            console.error('[Server Wrapper] Backend response status:', proxyRes.statusCode);
            
            let jsonData;
            try {
              jsonData = JSON.parse(responseData);
            } catch {
              jsonData = responseData;
            }
            
            console.error('[Server Wrapper] Backend response:', JSON.stringify(jsonData, null, 2).substring(0, 500));
            
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
          console.error('[Server Wrapper] Proxy request error:', error);
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
        console.error('[Server Wrapper] ==========================================');
        console.error('[Server Wrapper] ERROR en proxy:', error);
        console.error('[Server Wrapper] Error name:', error.name);
        console.error('[Server Wrapper] Error message:', error.message);
        console.error('[Server Wrapper] Error stack:', error.stack);
        console.error('[Server Wrapper] ==========================================');

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: error.message || 'Error al comunicarse con el backend',
          data: null
        }));
        return;
      }
    }

    // Para todas las demás peticiones, usar el servidor standalone de Next.js
    // Necesitamos ejecutar el servidor standalone en un proceso separado o cargarlo
    // Por ahora, redirigir a través del servidor standalone
    const standaloneServer = require('./server.js');
    await standaloneServer(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
}).listen(port, (err) => {
  if (err) throw err;
  console.log(`> Server wrapper ready on http://${hostname}:${port}`);
  console.log(`> Proxying /api/* to ${BACKEND_URL}`);
});


