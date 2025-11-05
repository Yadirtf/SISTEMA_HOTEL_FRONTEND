import { apiGet, apiPut } from "@/lib/api";
import type { Room } from "@/app/reservas/types";

export async function getRooms(token?: string) {
  return apiGet<Room[]>("/rooms", token);
}

export async function updateRoomStatus(roomNumber: string, status: string, token?: string) {
  return apiPut(`/rooms/${roomNumber}/status`, { status }, token);
}


