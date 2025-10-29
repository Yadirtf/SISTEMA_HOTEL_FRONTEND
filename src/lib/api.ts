export type Caja<T> = {
  ok: boolean;
  mensaje?: string;
  data?: T;
  errores?: unknown;
};

// Usar SIEMPRE el proxy /api para evitar CORS en desarrollo
const API_BASE = "/api";

export async function apiPost<TResponse, TBody = unknown>(path: string, body: TBody, token?: string): Promise<Caja<TResponse>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  // Si la respuesta no es OK, intentar devolver el cuerpo tal cual para obtener el mensaje del backend
  if (!res.ok) {
    try {
      const errJson = await res.json();
      return errJson as Caja<TResponse>;
    } catch {
      const errText = await res.text().catch(() => "");
      return { ok: false, mensaje: errText || `HTTP ${res.status}` } as Caja<TResponse>;
    }
  }

  try {
    const json = await res.json();
    return json as Caja<TResponse>;
  } catch {
    return { ok: false, mensaje: "Respuesta inválida del servidor" } as Caja<TResponse>;
  }
}

export type JwtResponseDto = {
  access_token: string;
  user: {
    idUsuario: number;
    correo: string;
    rol: string;
  };
};


