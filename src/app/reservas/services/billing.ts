import { apiGet, Caja } from "@/lib/api";
import type { Reservation } from "../types";
import type { LaundryService } from "../../lavanderia/types";

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
  allSales?: Array<{
    _id: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    total: number;
    saleDate: Date | string;
    paymentStatus?: 'paid' | 'pending';
  }>;
  allSalesTotal?: number;
  additionalCharges?: number; // Cargos adicionales registrados en el checkout
  pendingLaundryServices?: LaundryService[]; // Servicios de lavandería pendientes
  pendingLaundryServicesTotal?: number; // Total de servicios de lavandería pendientes
  allLaundryServices?: LaundryService[]; // Todos los servicios de lavandería (pendientes y pagados)
  allLaundryServicesTotal?: number; // Total de todos los servicios de lavandería
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

