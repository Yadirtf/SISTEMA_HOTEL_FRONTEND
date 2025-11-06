import { useEffect, useState, useCallback } from "react";
import { getSales, getSalesStats, getWeeklyReport, getBiweeklyReport, getMonthlyReport, getSalesReport } from "@/services/sales";
import { getToken } from "@/lib/session";
import type { Sale, SalesReport, ReportPeriod } from "../types";

export function useSalesData() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async (limit?: number) => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getSales(limit, token);
      if (resp.success && resp.data) {
        setSales(resp.data);
      }
    } catch (error) {
      console.error('[useSalesData] Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) return;

    try {
      const resp = await getSalesStats(token);
      if (resp.success && resp.data) {
        setStats(resp.data);
      }
    } catch (error) {
      console.error('[useSalesData] Error al cargar estadísticas:', error);
    }
  }, []);

  const loadReport = useCallback(async (period?: ReportPeriod, startDate?: Date, endDate?: Date, productId?: string) => {
    const token = getToken() || undefined;
    if (!token) return;

    try {
      let resp;
      if (period === 'weekly') {
        resp = await getWeeklyReport(token);
      } else if (period === 'biweekly') {
        resp = await getBiweeklyReport(token);
      } else if (period === 'monthly') {
        resp = await getMonthlyReport(token);
      } else {
        resp = await getSalesReport(period, startDate, endDate, productId, token);
      }

      if (resp.success && resp.data) {
        setReport(resp.data);
      }
    } catch (error) {
      console.error('[useSalesData] Error al cargar reporte:', error);
    }
  }, []);

  useEffect(() => {
    loadSales();
    loadStats();
  }, [loadSales, loadStats]);

  return { sales, stats, report, loading, loadSales, loadStats, loadReport };
}

