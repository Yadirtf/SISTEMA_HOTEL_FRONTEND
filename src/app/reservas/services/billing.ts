import { apiGet, Caja } from "@/lib/api";
import type { Reservation } from "../types";

export interface BillingLaundryItem {
  garmentName?: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface BillingLaundryService {
  _id?: string;
  serviceNumber: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus?: 'paid' | 'pending';
  createdAt?: string | Date;
  items: BillingLaundryItem[];
}

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
  pendingLaundryServices?: BillingLaundryService[];
  pendingLaundryTotal?: number;
  laundryServices?: BillingLaundryService[];
  laundryServicesTotal?: number;
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

