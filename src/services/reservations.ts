import { apiGet, apiPost } from "@/lib/api";

export async function getFloors(token?: string) {
  return apiGet<any[]>("/floors", token);
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


