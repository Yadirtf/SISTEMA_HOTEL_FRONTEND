// Servidor personalizado para Next.js que acepta certificados autofirmados
// Este archivo se usa solo si ejecutas: node server.js
// Para desarrollo normal, usa: npm run dev

const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Configurar para aceptar certificados autofirmados
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.prepare().then(() => {
  createServer(
    {
      // Opcional: puedes usar certificados SSL para el frontend también
      // key: fs.readFileSync(path.join(__dirname, 'ssl', 'private-key.pem')),
      // cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.pem')),
    },
    async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }
  ).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});




