import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';

// Rutas protegidas
const protectedPaths = [
  "/panel",
  "/panel/admin",
  "/reservas",
  "/huespedes",
  "/habitaciones",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Si es una ruta de API, hacer proxy manual al backend
  if (pathname.startsWith("/api/")) {
    console.error('[Middleware] ==========================================');
    console.error('[Middleware] API request:', pathname);
    console.error('[Middleware] Method:', req.method);
    console.error('[Middleware] Backend URL:', BACKEND_URL);
    
    try {
      // Construir la URL del backend
      const apiPath = pathname.replace('/api', '');
      const backendUrl = `${BACKEND_URL}${apiPath}${req.nextUrl.search}`;
      
      console.error('[Middleware] Proxying to:', backendUrl);
      
      // Obtener el body si existe
      let body: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const clonedRequest = req.clone();
          body = await clonedRequest.text();
          console.error('[Middleware] Body:', body.substring(0, 200));
        } catch (e) {
          console.error('[Middleware] Error reading body:', e);
        }
      }
      
      // Hacer la petición al backend
      const response = await fetch(backendUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(req.headers.entries()),
        },
        body: body,
      });
      
      console.error('[Middleware] Backend response status:', response.status);
      
      const data = await response.text();
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch {
        jsonData = data;
      }
      
      console.error('[Middleware] Backend response:', JSON.stringify(jsonData, null, 2).substring(0, 500));
      
      return NextResponse.json(jsonData, { 
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('[Middleware] ==========================================');
      console.error('[Middleware] ERROR en proxy:', error);
      console.error('[Middleware] Error name:', error.name);
      console.error('[Middleware] Error message:', error.message);
      console.error('[Middleware] Error stack:', error.stack);
      console.error('[Middleware] ==========================================');
      
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Error al comunicarse con el backend',
          data: null 
        },
        { status: 500 }
      );
    }
  }
  
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Restricción adicional por rol para la ruta de admin
  if (pathname.startsWith("/panel/admin")) {
    const role = req.cookies.get("auth_role")?.value || "";
    if (role !== "Administrador") {
      const url = req.nextUrl.clone();
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/panel",
    "/panel/admin",
    "/panel/admin/:path*",
    "/reservas",
    "/huespedes",
    "/habitaciones",
  ],
};
