import { apiGet, Caja } from "@/lib/api";
import type { Floor } from "@/app/habitaciones/types";

export async function getFloors(token?: string): Promise<Caja<Floor[]>> {
  return apiGet<Floor[]>("/floors", token);
}

