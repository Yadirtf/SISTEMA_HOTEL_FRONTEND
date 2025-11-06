import { apiGet, apiPost, Caja } from "@/lib/api";
import type { Sale, SaleFormData, SalesReport, ReportPeriod } from "@/app/tienda/types";

export async function createSale(data: SaleFormData, token?: string): Promise<Caja<Sale>> {
  return apiPost<Sale, SaleFormData>("/store/sales", data, token);
}

export async function getSales(limit?: number, token?: string): Promise<Caja<Sale[]>> {
  const url = limit ? `/store/sales?limit=${limit}` : `/store/sales`;
  return apiGet<Sale[]>(url, token);
}

export async function getSaleById(id: string, token?: string): Promise<Caja<Sale>> {
  return apiGet<Sale>(`/store/sales/${id}`, token);
}

export async function getSalesStats(token?: string): Promise<Caja<{
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  averageSale: number;
  todaySales: number;
  todayProfit: number;
  todayCount: number;
}>> {
  return apiGet("/store/sales/stats", token);
}

export async function getSalesReport(
  period?: ReportPeriod,
  startDate?: Date,
  endDate?: Date,
  productId?: string,
  token?: string
): Promise<Caja<SalesReport>> {
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  if (productId) params.append('productId', productId);
  
  const url = `/store/sales/report${params.toString() ? `?${params.toString()}` : ''}`;
  return apiGet<SalesReport>(url, token);
}

export async function getWeeklyReport(token?: string): Promise<Caja<SalesReport>> {
  return apiGet<SalesReport>("/store/sales/report/weekly", token);
}

export async function getBiweeklyReport(token?: string): Promise<Caja<SalesReport>> {
  return apiGet<SalesReport>("/store/sales/report/biweekly", token);
}

export async function getMonthlyReport(token?: string): Promise<Caja<SalesReport>> {
  return apiGet<SalesReport>("/store/sales/report/monthly", token);
}

