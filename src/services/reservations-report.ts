import { apiGet, Caja } from "@/lib/api";

export interface ReservationReportData {
  _id: string;
  roomNumber: string;
  documentNumber: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhoneNumber?: string;
  guestOrigin?: string;
  guestProfession?: string;
  checkInTime: Date | string;
  numberOfGuests: number;
  isPaid: boolean;
}

export async function getReservationsForReport(token?: string): Promise<Caja<ReservationReportData[]>> {
  // Obtener reservas activas (checked_in)
  const result = await apiGet<ReservationReportData[]>("/reservations?status=checked_in", token);
  return result;
}

