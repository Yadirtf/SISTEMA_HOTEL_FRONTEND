export type Caja<T> = {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
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
      return { success: false, message: errText || `HTTP ${res.status}`, data: undefined as unknown as TResponse } as Caja<TResponse>;
    }
  }

  try {
    const json = await res.json();
    return json as Caja<TResponse>;
  } catch {
    return { success: false, message: "Respuesta inválida del servidor", data: undefined as unknown as TResponse } as Caja<TResponse>;
  }
}

export async function apiGet<TResponse>(path: string, token?: string): Promise<Caja<TResponse>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    try {
      const errJson = await res.json();
      return errJson as Caja<TResponse>;
    } catch {
      const errText = await res.text().catch(() => "");
      return { success: false, message: errText || `HTTP ${res.status}`, data: undefined as unknown as TResponse } as Caja<TResponse>;
    }
  }

  try {
    const json = await res.json();
    return json as Caja<TResponse>;
  } catch {
    return { success: false, message: "Respuesta inválida del servidor", data: undefined as unknown as TResponse } as Caja<TResponse>;
  }
}

export async function apiPatch<TResponse, TBody = unknown>(path: string, body: TBody, token?: string): Promise<Caja<TResponse>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    try {
      const errJson = await res.json();
      return errJson as Caja<TResponse>;
    } catch {
      const errText = await res.text().catch(() => "");
      return { success: false, message: errText || `HTTP ${res.status}`, data: undefined as unknown as TResponse } as Caja<TResponse>;
    }
  }

  try {
    const json = await res.json();
    return json as Caja<TResponse>;
  } catch {
    return { success: false, message: "Respuesta inválida del servidor", data: undefined as unknown as TResponse } as Caja<TResponse>;
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


