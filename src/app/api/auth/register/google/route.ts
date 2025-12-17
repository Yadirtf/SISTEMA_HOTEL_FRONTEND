import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:5000';

export async function POST(request: NextRequest) {
  // Logging inicial
  console.error('[API Route] ==========================================');
  console.error('[API Route] /api/auth/register/google - Iniciando proxy');
  console.error('[API Route] BACKEND_URL:', BACKEND_URL);
  
  try {
    const body = await request.json();
    console.error('[API Route] Body recibido:', {
      idToken: body.idToken ? 'presente' : 'ausente',
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
    });

    const url = `${BACKEND_URL}/auth/register/google`;
    console.error('[API Route] Haciendo fetch a:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.error('[API Route] Respuesta recibida:', response.status, response.statusText);
    console.error('[API Route] Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.error('[API Route] Datos recibidos:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('[API Route] Error del backend:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.error('[API Route] Éxito - Usuario registrado');
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[API Route] ==========================================');
    console.error('[API Route] ERROR CAPTURADO:', error);
    console.error('[API Route] Error name:', error.name);
    console.error('[API Route] Error message:', error.message);
    console.error('[API Route] Error stack:', error.stack);
    console.error('[API Route] ==========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor',
        data: null,
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

