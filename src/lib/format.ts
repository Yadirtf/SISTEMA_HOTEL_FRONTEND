export function formatPrice(value: number): string {
  const integer = Math.round(Number(value) || 0);
  return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function stripNonDigits(value: string): string {
  return (value || "").replace(/\D+/g, "");
}

export function parseFormattedPrice(value: string): number {
  const digits = (value || "").replace(/\./g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export function formatPriceFromString(value: string): string {
  const digits = stripNonDigits(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formatea un número mientras se escribe, agregando puntos para miles
 * Mantiene decimales si están presentes
 * Ejemplo: "1234" -> "1.234", "1234,56" -> "1.234,56"
 */
export function formatNumberWhileTyping(value: string): string {
  if (!value || value.trim() === "") return "";
  
  // Detectar si hay coma (separador decimal en formato colombiano)
  const commaIndex = value.lastIndexOf(",");
  const hasComma = commaIndex !== -1;
  
  let integerPart = "";
  let decimalPart = "";
  
  if (hasComma) {
    // Formato: parte entera, coma, decimales
    integerPart = value.substring(0, commaIndex);
    decimalPart = value.substring(commaIndex + 1);
  } else {
    // No hay coma, toda la entrada es parte entera
    integerPart = value;
  }
  
  // Limpiar parte entera: remover todos los puntos (separadores de miles) y caracteres no numéricos
  integerPart = integerPart.replace(/\./g, "").replace(/\D/g, "");
  
  // Formatear parte entera con puntos de miles
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  // Limpiar y limitar decimales (máximo 2 dígitos)
  if (decimalPart) {
    decimalPart = decimalPart.replace(/\D/g, "").substring(0, 2);
    return `${integerPart},${decimalPart}`;
  }
  
  return integerPart;
}

/**
 * Formatea un número con decimales, mostrando separadores de miles
 * Ejemplo: 1234.56 -> "1.234,56" o "1,234.56" dependiendo de la configuración
 */
export function formatPriceWithDecimals(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "";
  
  // Convertir a string con 2 decimales
  const parts = value.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Formatear la parte entera con separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Retornar con coma como separador decimal (formato colombiano)
  return `${formattedInteger},${decimalPart}`;
}

/**
 * Parsea un precio formateado con decimales
 * Acepta tanto punto como coma como separador decimal
 * Ejemplo: "1.234,56" o "1,234.56" o "1234.56" o "1234,56" -> 1234.56
 */
export function parsePriceWithDecimals(value: string): number {
  if (!value || value.trim() === "") return 0;
  
  // Remover espacios
  let cleaned = value.trim();
  
  // Detectar el formato: si hay coma al final o cerca del final, es formato colombiano (1.234,56)
  // Si hay punto al final o cerca del final, es formato americano (1,234.56)
  const lastCommaIndex = cleaned.lastIndexOf(",");
  const lastDotIndex = cleaned.lastIndexOf(".");
  
  if (lastCommaIndex > lastDotIndex) {
    // Formato colombiano: 1.234,56
    // Remover todos los puntos (separadores de miles) y reemplazar coma por punto
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDotIndex > lastCommaIndex) {
    // Formato americano: 1,234.56
    // Remover todas las comas (separadores de miles), el punto ya es el separador decimal
    cleaned = cleaned.replace(/,/g, "");
  } else {
    // No hay separador decimal, solo números
    // Remover todos los puntos y comas (podrían ser separadores de miles)
    cleaned = cleaned.replace(/[.,]/g, "");
  }
  
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Formatea una fecha en formato legible en español con hora en formato de 12 horas (AM/PM)
 * @param dateString - Fecha en formato ISO string o Date
 * @returns Fecha formateada o "-" si no hay fecha
 * @example "15 ene 2024, 2:30 PM"
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Formato de 12 horas con AM/PM
  });
}

/**
 * Formatea solo la hora en formato de 12 horas (AM/PM)
 * @param dateString - Fecha en formato ISO string o Date
 * @returns Hora formateada o "-" si no hay fecha
 * @example "2:30 PM"
 */
export function formatTime(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Formato de 12 horas con AM/PM
  });
}

/**
 * Formatea un monto como moneda colombiana (COP)
 * Usa punto como separador de miles, sin decimales
 * @param amount - Monto a formatear
 * @returns Monto formateado como moneda (ej: "$ 1.234.567")
 */
export function formatCurrency(amount: number): string {
  const integer = Math.round(Number(amount) || 0);
  const formatted = integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${formatted}`;
}

/**
 * Formatea un número mientras se escribe en un input, agregando puntos para miles
 * Sin decimales - solo números enteros
 * @param value - Valor del input
 * @returns Valor formateado con puntos como separadores de miles
 */
export function formatNumberInput(value: string): string {
  if (!value || value.trim() === "") return "";
  
  // Remover todos los caracteres no numéricos excepto puntos (que serán removidos y re-agregados)
  const digits = value.replace(/\D/g, "");
  
  if (!digits) return "";
  
  // Formatear con puntos como separadores de miles
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parsea un valor formateado de input (con puntos) a número
 * @param value - Valor formateado del input
 * @returns Número sin formato
 */
export function parseFormattedNumber(value: string): number {
  if (!value || value.trim() === "") return 0;
  const digits = value.replace(/\./g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}


