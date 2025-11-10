import { apiGet, apiPost, apiPatch, Caja } from "@/lib/api";
import type { Floor } from "@/app/habitaciones/types";

export async function getFloors(token?: string): Promise<Caja<Floor[]>> {
  return apiGet<Floor[]>("/floors", token);
}

export async function getActiveReservationByRoom(roomNumber: string, token?: string) {
  return apiGet(`/reservations/room/${roomNumber}`, token);
}

export async function createReservation(body: any, token?: string) {
  return apiPost("/reservations", body, token);
}

export async function getOverdueReservations(token?: string) {
  return apiGet<any[]>("/reservations/overdue", token);
}

export async function getExpiringReservations(minutes: number, token?: string) {
  return apiGet<any[]>(`/reservations/expiring?minutes=${minutes}`, token);
}

export type Guest = {
  _id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  origin?: string;
  profession?: string;
};

export async function searchGuests(query: string, token?: string) {
  if (!query || query.trim().length < 2) {
    return { success: true, data: [], message: '' };
  }
  return apiGet<Guest[]>(`/reservations/guests/search?q=${encodeURIComponent(query.trim())}`, token);
}

export interface ActiveReservation {
  _id: string;
  roomNumber: string;
  documentNumber: string;
  guest?: {
    firstName: string;
    lastName: string;
    documentNumber: string;
  };
  room?: {
    number: string;
  };
}

export async function getActiveReservations(token?: string): Promise<Caja<ActiveReservation[]>> {
  return apiGet<ActiveReservation[]>("/reservations?status=checked_in", token);
}

export interface CheckOutData {
  additionalCharges?: number;
  paymentMethodId?: string;
  paymentTypeId?: string;
  notes?: string;
}

export async function checkOutReservation(reservationId: string, data: CheckOutData, token?: string) {
  return apiPatch(`/reservations/${reservationId}/check-out`, data, token);
}


