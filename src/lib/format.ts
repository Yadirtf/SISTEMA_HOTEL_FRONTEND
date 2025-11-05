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


