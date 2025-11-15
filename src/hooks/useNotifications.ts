import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "info";

export type Notification = {
  type: NotificationType;
  title: string;
  description?: string;
};

/**
 * Hook para gestionar notificaciones en la aplicación
 * @returns Estado de notificación y función para mostrarla
 */
export function useNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (type: NotificationType, title: string, description?: string) => {
      setNotification({ type, title, description });
      setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
    },
    []
  );

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification,
  };
}

