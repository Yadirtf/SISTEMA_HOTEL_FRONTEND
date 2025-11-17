import { apiGet, apiPost, apiPut, Caja } from "@/lib/api";
import type { CashRegister, CashRegisterFormData, CloseCashRegisterFormData, CashRegisterStats, CashRegisterAudit } from "@/app/caja/types";

export async function getCashRegisters(
  filters?: {
    status?: string;
    userId?: number;
  },
  token?: string
): Promise<Caja<CashRegister[]>> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.userId) params.append("userId", filters.userId.toString());

  const url = params.toString() ? `/cash-registers?${params.toString()}` : `/cash-registers`;
  return apiGet<CashRegister[]>(url, token);
}

export async function getCashRegisterById(id: string, token?: string): Promise<Caja<CashRegister>> {
  return apiGet<CashRegister>(`/cash-registers/${id}`, token);
}

export async function getOpenCashRegisterByUserId(userId: number, token?: string): Promise<Caja<CashRegister | null>> {
  return apiGet<CashRegister | null>(`/cash-registers/open/${userId}`, token);
}

export async function getCashRegisterStats(id: string, token?: string): Promise<Caja<CashRegisterStats>> {
  return apiGet<CashRegisterStats>(`/cash-registers/stats/${id}`, token);
}

export async function getCashRegisterAudits(id: string, token?: string): Promise<Caja<CashRegisterAudit[]>> {
  return apiGet<CashRegisterAudit[]>(`/cash-registers/audits/${id}`, token);
}

export async function createCashRegister(data: CashRegisterFormData, token?: string): Promise<Caja<CashRegister>> {
  return apiPost<CashRegister, CashRegisterFormData>("/cash-registers", data, token);
}

export async function updateCashRegister(
  id: string,
  data: Partial<CashRegisterFormData>,
  token?: string
): Promise<Caja<CashRegister>> {
  return apiPut<CashRegister, Partial<CashRegisterFormData>>(`/cash-registers/${id}`, data, token);
}

export async function closeCashRegister(
  id: string,
  data: CloseCashRegisterFormData,
  token?: string
): Promise<Caja<CashRegisterAudit>> {
  return apiPut<CashRegisterAudit, CloseCashRegisterFormData>(`/cash-registers/${id}/close`, data, token);
}

export async function suspendCashRegister(id: string, token?: string): Promise<Caja<CashRegister>> {
  return apiPut<CashRegister, {}>(`/cash-registers/${id}/suspend`, {}, token);
}

export async function resumeCashRegister(id: string, token?: string): Promise<Caja<CashRegister>> {
  return apiPut<CashRegister, {}>(`/cash-registers/${id}/resume`, {}, token);
}

// Funciones para autogestión de caja por recepcionista
export async function getMyCashRegister(token?: string): Promise<Caja<CashRegister | null>> {
  return apiGet<CashRegister | null>("/cash-registers/my-cash-register", token);
}

export async function openMyCashRegister(
  data: { initialAmount: number; notes?: string },
  token?: string
): Promise<Caja<CashRegister>> {
  return apiPost<CashRegister, { initialAmount: number; notes?: string }>(
    "/cash-registers/my-cash-register/open",
    data,
    token
  );
}

export async function getMyCashRegisterOperationsReport(token?: string): Promise<Caja<{
  totalSales: number;
  totalSalesAmount: number;
  totalReservations: number;
  totalReservationsAmount: number;
  totalCashIncome: number;
  totalCardIncome: number;
  totalTransferIncome: number;
  totalCashExpense: number; // Egresos en efectivo (cambios dados, retiros, etc.)
}>> {
  return apiGet<{
    totalSales: number;
    totalSalesAmount: number;
    totalReservations: number;
    totalReservationsAmount: number;
    totalCashIncome: number;
    totalCardIncome: number;
    totalTransferIncome: number;
    totalCashExpense: number;
  }>("/cash-registers/my-cash-register/operations-report", token);
}

export async function closeMyCashRegister(
  data: CloseCashRegisterFormData & {
    operationsReport?: {
      totalSales?: number;
      totalSalesAmount?: number;
      totalReservations?: number;
      totalReservationsAmount?: number;
      totalCashIncome?: number;
      totalCardIncome?: number;
      totalTransferIncome?: number;
      totalCashExpense?: number; // Egresos en efectivo (cambios dados, retiros, etc.)
    };
  },
  token?: string
): Promise<Caja<CashRegister>> {
  return apiPost<CashRegister, typeof data>(
    "/cash-registers/my-cash-register/close",
    data,
    token
  );
}

export async function openCashRegister(
  id: string,
  data: { initialAmount: number; notes?: string },
  token?: string
): Promise<Caja<CashRegister>> {
  return apiPut<CashRegister, { initialAmount: number; notes?: string }>(
    `/cash-registers/${id}/open`,
    data,
    token
  );
}


