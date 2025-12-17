// Servidor proxy que intercepta /api/* antes de pasarlo a Next.js
const { createServer } = require('http');
const { parse } = require('url');
const http = require('http');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const NEXTJS_PORT = 3001; // Puerto interno para Next.js

// Iniciar el servidor standalone de Next.js en un puerto interno
process.env.PORT = NEXTJS_PORT.toString();
require('./server.js');

// Crear servidor proxy que intercepta /api/*
const proxyServer = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Interceptar peticiones a /api/* y hacer proxy al backend
    if (pathname && pathname.startsWith('/api/')) {
      console.error('[Proxy Server] ==========================================');
      console.error('[Proxy Server] API request:', pathname);
      console.error('[Proxy Server] Method:', req.method);
      console.error('[Proxy Server] Backend URL:', BACKEND_URL);

      try {
        // Construir la URL del backend
        const apiPath = pathname.replace('/api', '');
        const backendUrl = `${BACKEND_URL}${apiPath}${parsedUrl.search || ''}`;
        
        console.error('[Proxy Server] Proxying to:', backendUrl);

        // Leer el body si existe
        let body = '';
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          await new Promise((resolve) => {
            req.on('end', resolve);
          });
          
          console.error('[Proxy Server] Body:', body.substring(0, 200));
        }

        // Hacer la petición al backend usando http/https nativo
        const https = require('https');
        const { URL } = require('url');
        
        const backendUrlObj = new URL(backendUrl);
        const client = backendUrlObj.protocol === 'https:' ? https : http;
        
        // Preparar headers, estableciendo Content-Length correctamente si hay body
        const headers = {
          'Content-Type': 'application/json',
          ...Object.fromEntries(Object.entries(req.headers).filter(([key]) => 
            !['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())
          )),
        };
        
        // Establecer Content-Length correctamente si hay body
        if (body && body.length > 0) {
          headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
        }
        
        const proxyReq = client.request({
          hostname: backendUrlObj.hostname,
          port: backendUrlObj.port || (backendUrlObj.protocol === 'https:' ? 443 : 80),
          path: backendUrlObj.pathname + backendUrlObj.search,
          method: req.method,
          headers: headers,
        }, (proxyRes) => {
          let responseData = '';
          proxyRes.on('data', chunk => {
            responseData += chunk.toString();
          });
          
          proxyRes.on('end', () => {
            console.error('[Proxy Server] Backend response status:', proxyRes.statusCode);
            
            let jsonData;
            try {
              jsonData = JSON.parse(responseData);
            } catch {
              jsonData = responseData;
            }
            
            console.error('[Proxy Server] Backend response:', JSON.stringify(jsonData, null, 2).substring(0, 500));
            
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
          console.error('[Proxy Server] Proxy request error:', error);
          console.error('[Proxy Server] Error name:', error.name);
          console.error('[Proxy Server] Error message:', error.message);
          console.error('[Proxy Server] Error code:', error.code);
          console.error('[Proxy Server] Error stack:', error.stack);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: error.message || 'Error al comunicarse con el backend',
            data: null
          }));
        });
        
        // Enviar el body si existe
        if (body && body.length > 0) {
          console.error('[Proxy Server] Sending body, length:', Buffer.byteLength(body, 'utf8'));
          proxyReq.write(body, 'utf8');
        }
        proxyReq.end();
        return;
      } catch (error) {
        console.error('[Proxy Server] ==========================================');
        console.error('[Proxy Server] ERROR en proxy:', error);
        console.error('[Proxy Server] Error name:', error.name);
        console.error('[Proxy Server] Error message:', error.message);
        console.error('[Proxy Server] Error stack:', error.stack);
        console.error('[Proxy Server] ==========================================');

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: error.message || 'Error al comunicarse con el backend',
          data: null
        }));
        return;
      }
    }

    // Para todas las demás peticiones, hacer proxy al servidor de Next.js
    const nextjsReq = http.request({
      hostname: 'localhost',
      port: NEXTJS_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    }, (nextjsRes) => {
      res.writeHead(nextjsRes.statusCode || 200, nextjsRes.headers);
      nextjsRes.pipe(res);
    });
    
    nextjsReq.on('error', (error) => {
      console.error('[Proxy Server] Error proxying to Next.js:', error);
      res.writeHead(500);
      res.end('Error interno del servidor');
    });
    
    req.pipe(nextjsReq);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
});

proxyServer.listen(port, hostname, (err) => {
  if (err) throw err;
  console.log(`> Proxy server ready on http://${hostname}:${port}`);
  console.log(`> Proxying /api/* to ${BACKEND_URL}`);
  console.log(`> Next.js running on port ${NEXTJS_PORT}`);
});


