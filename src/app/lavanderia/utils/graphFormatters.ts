/**
 * Utilidades para formatear valores de propiedades del grafo
 */

export const formatPropertyValue = (key: string, value: any): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  
  // Formatear fechas
  if (
    key.toLowerCase().includes("date") ||
    key.toLowerCase().includes("at") ||
    key === "createdAt" ||
    key === "updatedAt" ||
    key === "completedAt" ||
    key === "paidAt"
  ) {
    try {
      let date: Date;
      if (typeof value === "object" && value !== null) {
        // Si es un objeto Date o similar
        if (value instanceof Date) {
          date = value;
        } else if (value.$date) {
          // Formato MongoDB
          date = new Date(value.$date);
        } else if (value._seconds) {
          // Formato Firebase Timestamp
          date = new Date(value._seconds * 1000);
        } else if (value.year && value.month && value.day) {
          // Formato Neo4j DateTime
          date = new Date(value.year, value.month - 1, value.day, value.hour || 0, value.minute || 0, value.second || 0);
        } else if (value.toString && typeof value.toString === "function") {
          // Intentar convertir usando toString
          const dateStr = value.toString();
          date = new Date(dateStr);
        } else {
          // Intentar convertir directamente
          date = new Date(value);
        }
      } else if (typeof value === "string" || typeof value === "number") {
        date = new Date(value);
      } else {
        return String(value);
      }
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      // Si falla, intentar mostrar el objeto de forma más legible
      if (typeof value === "object" && value !== null) {
        try {
          // Intentar extraer información del objeto
          if (value.year) {
            return `${value.year}-${String(value.month || 0).padStart(2, '0')}-${String(value.day || 0).padStart(2, '0')} ${String(value.hour || 0).padStart(2, '0')}:${String(value.minute || 0).padStart(2, '0')}`;
          }
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      return String(value);
    }
  }
  
  // Formatear números monetarios
  if (
    key.toLowerCase().includes("amount") ||
    key.toLowerCase().includes("price") ||
    key.toLowerCase().includes("total")
  ) {
    if (typeof value === "number") {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(value);
    }
  }
  
  // Formatear estados
  if (key === "status") {
    const statusMap: Record<string, string> = {
      pending: "Pendiente",
      completed: "Completado",
      cancelled: "Cancelado",
      paid: "Pagado",
    };
    return statusMap[value] || value;
  }
  
  if (key === "paymentStatus") {
    const paymentStatusMap: Record<string, string> = {
      paid: "Pagado",
      pending: "Pendiente de Pago",
    };
    return paymentStatusMap[value] || value;
  }
  
  // Si es un objeto, mostrar un mensaje más claro
  if (typeof value === "object" && value !== null) {
    return "[Objeto]";
  }
  
  return String(value);
};

export const getPropertyLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    id: "ID",
    documentNumber: "Número de Documento",
    firstName: "Nombre",
    lastName: "Apellido",
    number: "Número de Habitación",
    serviceNumber: "Número de Servicio",
    status: "Estado",
    totalAmount: "Monto Total",
    userId: "ID de Usuario",
    createdAt: "Fecha de Creación",
    updatedAt: "Última Actualización",
    completedAt: "Fecha de Completado",
    paymentStatus: "Estado de Pago",
    paymentMethodId: "ID Método de Pago",
    paymentTypeId: "ID Tipo de Pago",
    paidAt: "Fecha de Pago",
  };
  return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

export const getNodeLabel = (node: any, nodeType: string): string => {
  if (nodeType === "Client") {
    return `${node.properties?.firstName || ""} ${node.properties?.lastName || ""}`.trim() || 
           node.properties?.documentNumber || 
           node.id;
  } else if (nodeType === "Room") {
    return `Habitación ${node.properties?.number || node.id}`;
  } else if (nodeType === "LaundryService") {
    return node.properties?.serviceNumber || node.id;
  }
  return node.id;
};

