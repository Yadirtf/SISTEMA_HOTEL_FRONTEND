export const statusToEs: Record<string, string> = {
  available: "Disponible",
  occupied: "Ocupada",
  maintenance: "Mantenimiento",
  cleaning: "Limpieza",
};

export function getStatusColor(status: string, fallback = "#9CA3AF"): string {
  switch (status) {
    case "available":
      return "#22c55e"; // Verde
    case "occupied":
      return "#ef4444"; // Rojo
    case "maintenance":
      return "#f59e0b"; // Amarillo
    case "cleaning":
      return "#3b82f6"; // Azul
    default:
      return fallback;
  }
}


