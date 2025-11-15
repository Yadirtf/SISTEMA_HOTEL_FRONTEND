import { useState, useEffect } from "react";
import { getSessionUser, SessionUser } from "@/lib/session";

/**
 * Hook para manejar la autenticación y evitar problemas de hidratación SSR/CSR
 * @returns Usuario actual, si es admin, y estado de hidratación
 */
export function useAuth() {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const sessionUser = getSessionUser();
    setUser(sessionUser);
    setIsAdmin(sessionUser?.rol === "Administrador");
  }, []);

  return {
    hydrated,
    user,
    isAdmin,
  };
}

