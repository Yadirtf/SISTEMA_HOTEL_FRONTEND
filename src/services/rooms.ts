import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { Room, RoomFormData } from "@/app/habitaciones/types";

export async function getRooms(includeInactive?: boolean, token?: string): Promise<Caja<Room[]>> {
  const url = includeInactive ? `/rooms?includeInactive=true` : `/rooms`;
  return apiGet<Room[]>(url, token);
}

export async function createRoom(data: RoomFormData, token?: string): Promise<Caja<Room>> {
  const body: any = {
    number: data.number,
    roomType: data.roomType,
    pricePerNight: data.pricePerNight,
    floor: data.floor,
    maxOccupancy: data.maxOccupancy,
    description: data.description,
    status: data.status,
    isActive: true,
  };
  return apiPost<Room, typeof body>("/rooms", body, token);
}

export async function updateRoom(roomNumber: string, data: Partial<RoomFormData>, token?: string): Promise<Caja<Room>> {
  const body: any = {
    ...data,
  };
  if (data.roomType) body.roomType = data.roomType;
  if (data.floor) body.floor = data.floor;
  return apiPut<Room, typeof body>(`/rooms/number/${roomNumber}`, body, token);
}

export async function updateRoomStatus(roomNumber: string, status: string, token?: string): Promise<Caja<Room>> {
  return apiPut<Room, { status: string }>(`/rooms/number/${roomNumber}/status`, { status }, token);
}

export async function deleteRoom(roomNumber: string, token?: string): Promise<Caja<Room>> {
  return apiDelete<Room>(`/rooms/number/${roomNumber}`, token);
}

export async function deleteRoomPermanent(roomNumber: string, token?: string): Promise<Caja<any>> {
  return apiDelete<any>(`/rooms/number/${roomNumber}/permanent`, token);
}

export async function toggleRoomActive(roomNumber: string, isActive: boolean, token?: string): Promise<Caja<Room>> {
  if (isActive) {
    // Para activar, usar PUT con isActive: true
    return apiPut<Room, { isActive: boolean }>(`/rooms/number/${roomNumber}`, { isActive: true }, token);
  } else {
    // Para desactivar, usar DELETE (soft delete)
    return apiDelete<Room>(`/rooms/number/${roomNumber}`, token);
  }
}


