import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { Company, CompanyFormData, CompanyStats } from "@/app/huespedes/types";

export async function getCompanies(
  filters?: {
    status?: string;
    search?: string;
  },
  token?: string
): Promise<Caja<Company[]>> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  
  const url = params.toString() ? `/companies?${params.toString()}` : `/companies`;
  return apiGet<Company[]>(url, token);
}

export async function getCompanyById(id: string, token?: string): Promise<Caja<Company>> {
  return apiGet<Company>(`/companies/${id}`, token);
}

export async function searchCompanies(query: string, token?: string): Promise<Caja<Company[]>> {
  if (!query || query.trim().length < 2) {
    return { success: true, data: [], message: '' };
  }
  return apiGet<Company[]>(`/companies/search/${encodeURIComponent(query.trim())}`, token);
}

export async function getCompanyStats(token?: string): Promise<Caja<CompanyStats>> {
  return apiGet<CompanyStats>(`/companies/stats`, token);
}

export async function createCompany(data: CompanyFormData, token?: string): Promise<Caja<Company>> {
  const body: any = {
    name: data.name,
    nit: data.nit,
    address: data.address || undefined,
    contact: data.contact || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    contractNumber: data.contractNumber || undefined,
    notes: data.notes || undefined,
  };
  
  return apiPost<Company, typeof body>(`/companies`, body, token);
}

export async function updateCompany(id: string, data: Partial<CompanyFormData>, token?: string): Promise<Caja<Company>> {
  const body: any = {};
  
  if (data.name !== undefined) body.name = data.name;
  if (data.nit !== undefined) body.nit = data.nit;
  if (data.address !== undefined && data.address !== '') body.address = data.address;
  if (data.contact !== undefined && data.contact !== '') body.contact = data.contact;
  if (data.phone !== undefined && data.phone !== '') body.phone = data.phone;
  if (data.email !== undefined && data.email !== '') body.email = data.email;
  if (data.contractNumber !== undefined && data.contractNumber !== '') body.contractNumber = data.contractNumber;
  if (data.notes !== undefined && data.notes !== '') body.notes = data.notes;
  
  return apiPut<Company, typeof body>(`/companies/${id}`, body, token);
}

export async function deactivateCompany(id: string, token?: string): Promise<Caja<Company>> {
  return apiDelete<Company>(`/companies/${id}`, token);
}

export async function activateCompany(id: string, token?: string): Promise<Caja<Company>> {
  return apiPut<Company, {}>(`/companies/${id}/activate`, {}, token);
}

export async function deleteCompanyPermanent(id: string, token?: string): Promise<Caja<null>> {
  return apiDelete<null>(`/companies/${id}/permanent`, token);
}

