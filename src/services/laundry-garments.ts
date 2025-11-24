import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { LaundryGarment, LaundryGarmentFormData } from "@/app/lavanderia/types";

export async function getLaundryGarments(categoryId?: string, includeInactive?: boolean, token?: string): Promise<Caja<LaundryGarment[]>> {
  let url = `/laundry/garments`;
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId);
  if (includeInactive) params.append('includeInactive', 'true');
  if (params.toString()) url += `?${params.toString()}`;
  return apiGet<LaundryGarment[]>(url, token);
}

export async function getLaundryGarmentById(id: string, token?: string): Promise<Caja<LaundryGarment>> {
  return apiGet<LaundryGarment>(`/laundry/garments/${id}`, token);
}

export async function createLaundryGarment(data: LaundryGarmentFormData, token?: string): Promise<Caja<LaundryGarment>> {
  return apiPost<LaundryGarment, LaundryGarmentFormData>("/laundry/garments", data, token);
}

export async function updateLaundryGarment(id: string, data: Partial<LaundryGarmentFormData>, token?: string): Promise<Caja<LaundryGarment>> {
  return apiPut<LaundryGarment, Partial<LaundryGarmentFormData>>(`/laundry/garments/${id}`, data, token);
}

export async function deleteLaundryGarment(id: string, token?: string): Promise<Caja<LaundryGarment>> {
  return apiDelete<LaundryGarment>(`/laundry/garments/${id}`, token);
}

