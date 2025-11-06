import { apiGet, Caja } from "@/lib/api";
import type { Reservation } from "../types";

export interface BillingDetails {
  reservation: Reservation;
  pendingSales: Array<{
    _id: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    total: number;
    saleDate: Date | string;
  }>;
  pendingSalesTotal: number;
  totalToPay: number;
}

export async function getBillingActiveReservations(token?: string): Promise<Caja<Reservation[]>> {
  return apiGet<Reservation[]>("/reservations/billing/active", token);
}

export async function getBillingOverdueReservations(token?: string): Promise<Caja<Reservation[]>> {
  return apiGet<Reservation[]>("/reservations/billing/overdue", token);
}

export async function getBillingDetails(reservationId: string, token?: string): Promise<Caja<BillingDetails>> {
  return apiGet<BillingDetails>(`/reservations/billing/details/${reservationId}`, token);
}

