// Script para modificar el servidor standalone de Next.js y agregar proxy de API
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';

if (!fs.existsSync(serverPath)) {
  console.error('Error: server.js no encontrado');
  process.exit(1);
}

let serverCode = fs.readFileSync(serverPath, 'utf8');

// Buscar donde se inicia el servidor y agregar el proxy antes
// El servidor standalone usa startServer, necesitamos interceptar antes
const proxyCode = `
// Proxy de API agregado automáticamente
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { parse } = require('url');

const BACKEND_URL = '${BACKEND_URL}';

// Función para hacer proxy de peticiones API
async function proxyApiRequest(req, res, pathname, search) {
  return new Promise((resolve) => {
    console.error('[API Proxy] ==========================================');
    console.error('[API Proxy] API request:', pathname);
    console.error('[API Proxy] Method:', req.method);
    console.error('[API Proxy] Backend URL:', BACKEND_URL);
    
    try {
      const apiPath = pathname.replace('/api', '');
      const backendUrl = BACKEND_URL + apiPath + (search || '');
      
      console.error('[API Proxy] Proxying to:', backendUrl);
      
      let body = '';
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          console.error('[API Proxy] Body:', body.substring(0, 200));
          makeProxyRequest(req, res, backendUrl, body, resolve);
        });
      } else {
        makeProxyRequest(req, res, backendUrl, '', resolve);
      }
    } catch (error) {
      console.error('[API Proxy] ERROR:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: error.message || 'Error al comunicarse con el backend',
        data: null
      }));
      resolve();
    }
  });
}

function makeProxyRequest(req, res, backendUrl, body, resolve) {
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
      console.error('[API Proxy] Backend response status:', proxyRes.statusCode);
      
      let jsonData;
      try {
        jsonData = JSON.parse(responseData);
      } catch {
        jsonData = responseData;
      }
      
      console.error('[API Proxy] Backend response:', JSON.stringify(jsonData, null, 2).substring(0, 500));
      
      res.writeHead(proxyRes.statusCode || 500, {
        'Content-Type': 'application/json',
        ...Object.fromEntries(Object.entries(proxyRes.headers).filter(([key]) => 
          !['connection', 'transfer-encoding'].includes(key.toLowerCase())
        )),
      });
      res.end(JSON.stringify(jsonData));
      resolve();
    });
  });
  
  proxyReq.on('error', (error) => {
    console.error('[API Proxy] Proxy request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: error.message || 'Error al comunicarse con el backend',
      data: null
    }));
    resolve();
  });
  
  if (body) {
    proxyReq.write(body);
  }
  proxyReq.end();
}

// Interceptar el módulo http para agregar el proxy
const originalCreateServer = http.createServer;
http.createServer = function(options, requestListener) {
  if (typeof options === 'function') {
    requestListener = options;
    options = {};
  }
  
  const wrappedListener = async function(req, res) {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    
    if (pathname && pathname.startsWith('/api/')) {
      await proxyApiRequest(req, res, pathname, parsedUrl.search);
      return;
    }
    
    if (requestListener) {
      return requestListener(req, res);
    }
  };
  
  return originalCreateServer.call(this, options, wrappedListener);
};
`;

// Insertar el código del proxy antes de require('next')
const insertPoint = serverCode.indexOf("require('next')");
if (insertPoint !== -1) {
  serverCode = serverCode.slice(0, insertPoint) + proxyCode + '\n' + serverCode.slice(insertPoint);
  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('Servidor modificado exitosamente');
} else {
  console.error('No se pudo encontrar el punto de inserción en server.js');
  process.exit(1);
}





