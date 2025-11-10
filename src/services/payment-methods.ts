import { apiGet, apiPost, apiPut, apiDelete, Caja } from "@/lib/api";

export interface PaymentMethod {
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentType {
  _id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  requiresFullPayment: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentMethodFormData {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface PaymentTypeFormData {
  name: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  requiresFullPayment?: boolean;
}

// Payment Methods
export async function getPaymentMethods(includeInactive?: boolean, token?: string): Promise<Caja<PaymentMethod[]>> {
  const url = includeInactive ? '/payments/methods?includeInactive=true' : '/payments/methods';
  return apiGet<PaymentMethod[]>(url, token);
}

export async function getPaymentMethodById(id: string, token?: string): Promise<Caja<PaymentMethod>> {
  return apiGet<PaymentMethod>(`/payments/methods/${id}`, token);
}

export async function createPaymentMethod(data: PaymentMethodFormData, token?: string): Promise<Caja<PaymentMethod>> {
  return apiPost<PaymentMethod, PaymentMethodFormData>('/payments/methods', data, token);
}

export async function updatePaymentMethod(id: string, data: Partial<PaymentMethodFormData>, token?: string): Promise<Caja<PaymentMethod>> {
  return apiPut<PaymentMethod, Partial<PaymentMethodFormData>>(`/payments/methods/${id}`, data, token);
}

export async function deletePaymentMethod(id: string, token?: string): Promise<Caja<null>> {
  return apiDelete(`/payments/methods/${id}`, token);
}

// Payment Types
export async function getPaymentTypes(includeInactive?: boolean, token?: string): Promise<Caja<PaymentType[]>> {
  const url = includeInactive ? '/payments/types?includeInactive=true' : '/payments/types';
  return apiGet<PaymentType[]>(url, token);
}

export async function getPaymentTypeById(id: string, token?: string): Promise<Caja<PaymentType>> {
  return apiGet<PaymentType>(`/payments/types/${id}`, token);
}

export async function createPaymentType(data: PaymentTypeFormData, token?: string): Promise<Caja<PaymentType>> {
  return apiPost<PaymentType, PaymentTypeFormData>('/payments/types', data, token);
}

export async function updatePaymentType(id: string, data: Partial<PaymentTypeFormData>, token?: string): Promise<Caja<PaymentType>> {
  return apiPut<PaymentType, Partial<PaymentTypeFormData>>(`/payments/types/${id}`, data, token);
}

export async function deletePaymentType(id: string, token?: string): Promise<Caja<null>> {
  return apiDelete(`/payments/types/${id}`, token);
}

