import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { Client, ClientFormData, ClientStats } from "@/app/huespedes/types";

export async function getClients(
  filters?: {
    status?: string;
    isCompanyClient?: boolean;
    search?: string;
  },
  token?: string
): Promise<Caja<Client[]>> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.isCompanyClient !== undefined) params.append("isCompanyClient", String(filters.isCompanyClient));
  if (filters?.search) params.append("search", filters.search);
  
  const url = params.toString() ? `/clients?${params.toString()}` : `/clients`;
  return apiGet<Client[]>(url, token);
}

export async function getClientById(id: string, token?: string): Promise<Caja<Client>> {
  return apiGet<Client>(`/clients/${id}`, token);
}

export async function getClientByDocument(documentNumber: string, token?: string): Promise<Caja<Client | null>> {
  return apiGet<Client | null>(`/clients/document/${documentNumber}`, token);
}

export async function searchClients(query: string, token?: string): Promise<Caja<Client[]>> {
  if (!query || query.trim().length < 2) {
    return { success: true, data: [], message: '' };
  }
  return apiGet<Client[]>(`/clients/search?q=${encodeURIComponent(query.trim())}`, token);
}

export async function getCompanyClients(token?: string): Promise<Caja<Client[]>> {
  return apiGet<Client[]>(`/clients/company`, token);
}

export async function getRegularClients(token?: string): Promise<Caja<Client[]>> {
  return apiGet<Client[]>(`/clients/regular`, token);
}

export async function getClientStats(token?: string): Promise<Caja<ClientStats>> {
  return apiGet<ClientStats>(`/clients/stats`, token);
}

export async function createClient(data: ClientFormData, token?: string): Promise<Caja<Client>> {
  const body: any = {
    documentNumber: data.documentNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    email: data.email,
    origin: data.origin,
    profession: data.profession,
    notes: data.notes,
    isCompanyClient: data.isCompanyClient || false,
    companyId: data.companyId,
  };
  return apiPost<Client, typeof body>("/clients", body, token);
}

export async function updateClient(id: string, data: Partial<ClientFormData>, token?: string): Promise<Caja<Client>> {
  console.log("updateClient - ID recibido:", id);
  console.log("updateClient - Datos recibidos:", data);
  
  // No enviar documentNumber en la actualización (no es modificable)
  const { documentNumber, ...updateData } = data;
  
  // Convertir strings vacíos a undefined para campos opcionales
  const body: any = {};
  
  if (updateData.firstName !== undefined) body.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) body.lastName = updateData.lastName;
  if (updateData.phoneNumber !== undefined) body.phoneNumber = updateData.phoneNumber;
  if (updateData.email !== undefined && updateData.email !== '') body.email = updateData.email;
  if (updateData.origin !== undefined && updateData.origin !== '') body.origin = updateData.origin;
  if (updateData.profession !== undefined && updateData.profession !== '') body.profession = updateData.profession;
  if (updateData.notes !== undefined && updateData.notes !== '') body.notes = updateData.notes;
  if (updateData.isCompanyClient !== undefined) body.isCompanyClient = updateData.isCompanyClient;
  if (updateData.companyId !== undefined) body.companyId = updateData.companyId;
  
  console.log("updateClient - Body final:", body);
  console.log("updateClient - URL:", `/clients/${id}`);
  
  return apiPut<Client, typeof body>(`/clients/${id}`, body, token);
}

export async function deactivateClient(id: string, token?: string): Promise<Caja<Client>> {
  return apiDelete<Client>(`/clients/${id}`, token);
}

export async function activateClient(id: string, token?: string): Promise<Caja<Client>> {
  return apiPut<Client, {}>(`/clients/${id}/activate`, {}, token);
}

export async function deleteClientPermanent(id: string, token?: string): Promise<Caja<any>> {
  return apiDelete<any>(`/clients/${id}/permanent`, token);
}

