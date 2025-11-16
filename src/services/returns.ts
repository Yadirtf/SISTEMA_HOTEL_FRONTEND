import { apiGet, apiPost, Caja } from "@/lib/api";
import type { Return, ReturnFormData } from "@/app/tienda/types";

export async function createReturn(data: ReturnFormData, token?: string): Promise<Caja<Return>> {
  return apiPost<Return, ReturnFormData>("/store/returns", data, token);
}

export async function getReturns(
  filters?: {
    saleId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  },
  token?: string
): Promise<Caja<Return[]>> {
  const params = new URLSearchParams();
  if (filters?.saleId) params.append('saleId', filters.saleId);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/store/returns?${queryString}` : '/store/returns';
  return apiGet<Return[]>(url, token);
}

export async function getReturnById(id: string, token?: string): Promise<Caja<Return>> {
  return apiGet<Return>(`/store/returns/${id}`, token);
}

export async function getReturnsBySaleId(saleId: string, token?: string): Promise<Caja<Return[]>> {
  return apiGet<Return[]>(`/store/returns/sale/${saleId}`, token);
}

