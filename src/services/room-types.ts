import { apiGet, Caja } from "@/lib/api";
import type { RoomType } from "@/app/habitaciones/types";

export async function getRoomTypes(includeInactive?: boolean, token?: string): Promise<Caja<RoomType[]>> {
  const url = includeInactive ? `/rooms/types?includeInactive=true` : `/rooms/types`;
  return apiGet<RoomType[]>(url, token);
}

