import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { LaundryCategory, LaundryCategoryFormData } from "@/app/lavanderia/types";

export async function getLaundryCategories(includeInactive?: boolean, token?: string): Promise<Caja<LaundryCategory[]>> {
  const url = includeInactive ? `/laundry/categories?includeInactive=true` : `/laundry/categories`;
  return apiGet<LaundryCategory[]>(url, token);
}

export async function getLaundryCategoryById(id: string, token?: string): Promise<Caja<LaundryCategory>> {
  return apiGet<LaundryCategory>(`/laundry/categories/${id}`, token);
}

export async function createLaundryCategory(data: LaundryCategoryFormData, token?: string): Promise<Caja<LaundryCategory>> {
  return apiPost<LaundryCategory, LaundryCategoryFormData>("/laundry/categories", data, token);
}

export async function updateLaundryCategory(id: string, data: Partial<LaundryCategoryFormData>, token?: string): Promise<Caja<LaundryCategory>> {
  return apiPut<LaundryCategory, Partial<LaundryCategoryFormData>>(`/laundry/categories/${id}`, data, token);
}

export async function deleteLaundryCategory(id: string, token?: string): Promise<Caja<LaundryCategory>> {
  return apiDelete<LaundryCategory>(`/laundry/categories/${id}`, token);
}

