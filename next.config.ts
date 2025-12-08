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
  async rewrites() {
    // Usar HTTPS si está disponible, sino HTTP como fallback
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5000";
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
