import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";
import type { LaundryService, LaundryServiceFormData, CompleteLaundryServiceFormData } from "@/app/lavanderia/types";

export async function getLaundryServices(filters?: {
  clientId?: string;
  roomId?: string;
  roomNumber?: string;
  status?: string;
}, token?: string): Promise<Caja<LaundryService[]>> {
  let url = `/laundry/services`;
  const params = new URLSearchParams();
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.roomId) params.append('roomId', filters.roomId);
  if (filters?.roomNumber) params.append('roomNumber', filters.roomNumber);
  if (filters?.status) params.append('status', filters.status);
  if (params.toString()) url += `?${params.toString()}`;
  return apiGet<LaundryService[]>(url, token);
}

export async function getLaundryServiceById(id: string, token?: string): Promise<Caja<LaundryService>> {
  return apiGet<LaundryService>(`/laundry/services/${id}`, token);
}

export async function getLaundryServicesByClient(clientId: string, token?: string): Promise<Caja<LaundryService[]>> {
  return apiGet<LaundryService[]>(`/laundry/services/client/${clientId}`, token);
}

export async function getLaundryServicesByRoom(roomNumber: string, token?: string): Promise<Caja<LaundryService[]>> {
  return apiGet<LaundryService[]>(`/laundry/services/room/${roomNumber}`, token);
}

export async function getRoomsWithActiveReservations(token?: string): Promise<Caja<Array<{
  room: {
    _id: string;
    number: string;
  };
  reservation: {
    _id: string;
  };
  client: {
    _id: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
  };
}>>> {
  return apiGet<Array<{
    room: {
      _id: string;
      number: string;
    };
    reservation: {
      _id: string;
    };
    client: {
      _id: string;
      documentNumber: string;
      firstName: string;
      lastName: string;
    };
  }>>(`/laundry/services/rooms-with-active-reservations`, token);
}

export async function createLaundryService(data: LaundryServiceFormData, token?: string): Promise<Caja<LaundryService>> {
  return apiPost<LaundryService, LaundryServiceFormData>("/laundry/services", data, token);
}

export async function updateLaundryService(id: string, data: Partial<LaundryServiceFormData>, token?: string): Promise<Caja<LaundryService>> {
  return apiPut<LaundryService, Partial<LaundryServiceFormData>>(`/laundry/services/${id}`, data, token);
}

export async function completeLaundryService(id: string, data: CompleteLaundryServiceFormData, token?: string): Promise<Caja<LaundryService>> {
  return apiPost<LaundryService, CompleteLaundryServiceFormData>(`/laundry/services/${id}/complete`, data, token);
}

export async function cancelLaundryService(id: string, token?: string): Promise<Caja<LaundryService>> {
  return apiDelete<LaundryService>(`/laundry/services/${id}`, token);
}

