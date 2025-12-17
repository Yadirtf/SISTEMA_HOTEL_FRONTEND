import type { NextConfig } from "next";
import * as https from 'https';

// Configurar Node.js para aceptar certificados autofirmados en desarrollo
// SOLO para desarrollo local con certificados autofirmados
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Crear un agente HTTPS que ignore errores de certificado
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });
  
  // Hacer el agente disponible globalmente para Next.js
  (global as any).httpsAgent = httpsAgent;
}

const nextConfig: NextConfig = {
  output: 'standalone', // Necesario para Docker
  async rewrites() {
    // En Docker, usar el nombre del servicio 'backend' en lugar de 'localhost'
    // En desarrollo local, usar 'localhost'
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
  // Configurar el servidor para usar el agente HTTPS personalizado
  async headers() {
    return [];
  },
};

export default nextConfig;
