import { apiGet, Caja } from "@/lib/api";
import type { HistoryReservation } from "../types";

export async function getReservationHistory(token?: string): Promise<Caja<HistoryReservation[]>> {
  return apiGet<HistoryReservation[]>("/reservations?status=checked_out", token);
}

