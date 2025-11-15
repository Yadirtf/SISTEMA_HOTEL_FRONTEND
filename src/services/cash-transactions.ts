import { apiGet, apiPost, Caja } from "@/lib/api";
import type { CashTransaction, CashTransactionFormData, TransactionStats } from "@/app/caja/types";

export async function getCashTransactions(
  filters?: {
    cashRegisterId?: string;
    userId?: number;
    transactionType?: "income" | "expense";
    transactionCategory?: string;
    paymentMethodId?: string;
    startDate?: string;
    endDate?: string;
  },
  token?: string
): Promise<Caja<CashTransaction[]>> {
  const params = new URLSearchParams();
  if (filters?.cashRegisterId) params.append("cashRegisterId", filters.cashRegisterId);
  if (filters?.userId) params.append("userId", filters.userId.toString());
  if (filters?.transactionType) params.append("transactionType", filters.transactionType);
  if (filters?.transactionCategory) params.append("transactionCategory", filters.transactionCategory);
  if (filters?.paymentMethodId) params.append("paymentMethodId", filters.paymentMethodId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const url = params.toString() ? `/cash-transactions?${params.toString()}` : `/cash-transactions`;
  return apiGet<CashTransaction[]>(url, token);
}

export async function getCashTransactionById(id: string, token?: string): Promise<Caja<CashTransaction>> {
  return apiGet<CashTransaction>(`/cash-transactions/${id}`, token);
}

export async function getTransactionStats(
  filters?: {
    cashRegisterId?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  },
  token?: string
): Promise<Caja<TransactionStats>> {
  const params = new URLSearchParams();
  if (filters?.cashRegisterId) params.append("cashRegisterId", filters.cashRegisterId);
  if (filters?.userId) params.append("userId", filters.userId.toString());
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const url = params.toString() ? `/cash-transactions/stats?${params.toString()}` : `/cash-transactions/stats`;
  return apiGet<TransactionStats>(url, token);
}

export async function createCashTransaction(data: CashTransactionFormData, token?: string): Promise<Caja<CashTransaction>> {
  return apiPost<CashTransaction, CashTransactionFormData>("/cash-transactions", data, token);
}


