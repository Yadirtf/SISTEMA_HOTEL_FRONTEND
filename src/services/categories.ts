import { apiGet, apiPost, apiPut, apiPatch, apiDelete, Caja } from "@/lib/api";
import type { Category, CategoryFormData } from "@/app/tienda/types";

export async function getCategories(includeInactive?: boolean, token?: string): Promise<Caja<Category[]>> {
  const url = includeInactive ? `/store/categories?includeInactive=true` : `/store/categories`;
  return apiGet<Category[]>(url, token);
}

export async function getCategoryById(id: string, token?: string): Promise<Caja<Category>> {
  return apiGet<Category>(`/store/categories/${id}`, token);
}

export async function createCategory(data: CategoryFormData, token?: string): Promise<Caja<Category>> {
  return apiPost<Category, CategoryFormData>("/store/categories", data, token);
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>, token?: string): Promise<Caja<Category>> {
  return apiPut<Category, Partial<CategoryFormData>>(`/store/categories/${id}`, data, token);
}

export async function toggleCategoryActive(id: string, token?: string): Promise<Caja<Category>> {
  return apiPatch<Category>(`/store/categories/${id}/toggle-active`, {}, token);
}

export async function deleteCategory(id: string, token?: string): Promise<Caja<void>> {
  return apiDelete<void>(`/store/categories/${id}`, token);
}

export async function getCategoryProductsCount(id: string, token?: string): Promise<Caja<{ count: number }>> {
  return apiGet<{ count: number }>(`/store/categories/${id}/products-count`, token);
}

export async function getCategoryStats(token?: string): Promise<Caja<{
  total: number;
  active: number;
  inactive: number;
  categoriesWithProducts: number;
}>> {
  return apiGet("/store/categories/stats", token);
}

