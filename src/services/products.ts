import { apiGet, apiPost, apiPut, apiPatch, apiDelete, Caja } from "@/lib/api";
import type { Product, ProductFormData } from "@/app/tienda/types";

export async function getProducts(includeInactive?: boolean, token?: string): Promise<Caja<Product[]>> {
  const url = includeInactive ? `/store/products?includeInactive=true` : `/store/products`;
  return apiGet<Product[]>(url, token);
}

export async function getProductById(id: string, token?: string): Promise<Caja<Product>> {
  return apiGet<Product>(`/store/products/${id}`, token);
}

export async function getProductByBarcode(barcode: string, token?: string): Promise<Caja<Product>> {
  return apiGet<Product>(`/store/products/barcode/${barcode}`, token);
}

export async function searchProducts(query: string, includeInactive?: boolean, token?: string): Promise<Caja<Product[]>> {
  const includeInactiveParam = includeInactive ? '&includeInactive=true' : '';
  return apiGet<Product[]>(`/store/products/search?q=${encodeURIComponent(query)}${includeInactiveParam}`, token);
}

export async function getProductsByCategory(categoryId: string, includeInactive?: boolean, token?: string): Promise<Caja<Product[]>> {
  const url = includeInactive 
    ? `/store/products/category/${categoryId}?includeInactive=true` 
    : `/store/products/category/${categoryId}`;
  return apiGet<Product[]>(url, token);
}

export async function createProduct(data: ProductFormData, token?: string): Promise<Caja<Product>> {
  return apiPost<Product, ProductFormData>("/store/products", data, token);
}

export async function updateProduct(id: string, data: Partial<ProductFormData>, token?: string): Promise<Caja<Product>> {
  return apiPut<Product, Partial<ProductFormData>>(`/store/products/${id}`, data, token);
}

export async function updateProductStock(id: string, stock: number, notes?: string, token?: string): Promise<Caja<Product>> {
  return apiPatch<Product, { stock: number; notes?: string }>(`/store/products/${id}/stock`, { stock, notes }, token);
}

export async function toggleProductActive(id: string, token?: string): Promise<Caja<Product>> {
  return apiPatch<Product>(`/store/products/${id}/toggle-active`, {}, token);
}

export async function deleteProduct(id: string, token?: string): Promise<Caja<void>> {
  return apiDelete<void>(`/store/products/${id}`, token);
}

export async function getProductStats(token?: string): Promise<Caja<{
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  totalStockValue: number;
}>> {
  return apiGet("/store/products/stats", token);
}

export async function getLowStockProducts(threshold?: number, token?: string): Promise<Caja<Product[]>> {
  const url = threshold ? `/store/products/low-stock?threshold=${threshold}` : `/store/products/low-stock`;
  return apiGet<Product[]>(url, token);
}

