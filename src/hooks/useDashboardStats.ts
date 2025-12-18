"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/session";
import {
  getReservationStats,
  getGuestStats,
  getStoreStats,
  getCashStats,
  getLaundryStats,
  DashboardStats,
  ReservationStats,
  GuestStats,
  StoreStats,
  CashStats,
  LaundryStats,
} from "@/services/dashboard";

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  reservations: {
    totalReservations: 0,
    confirmedReservations: 0,
    checkedInReservations: 0,
    checkedOutReservations: 0,
    cancelledReservations: 0,
    totalRevenue: 0,
    averageStayDuration: 0,
  },
  guests: {
    totalGuests: 0,
    activeGuests: 0,
    inactiveGuests: 0,
    blacklistedGuests: 0,
    newGuestsThisMonth: 0,
  },
  store: {
    totalSales: 0,
    totalProfit: 0,
    salesCount: 0,
    averageSale: 0,
    todaySales: 0,
    todayProfit: 0,
    todayCount: 0,
    totalReturns: 0,
    todayReturns: 0,
  },
  cash: {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
    incomeByCategory: {},
    expenseByCategory: {},
    incomeByPaymentMethod: {},
    totalCashIncome: 0,
    totalTransferIncome: 0,
  },
  laundry: {
    totalServices: 0,
    pendingServices: 0,
    inProgressServices: 0,
    completedServices: 0,
    cancelledServices: 0,
    totalRevenue: 0,
    todayServices: 0,
    todayRevenue: 0,
  },
};

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const [reservationsResult, guestsResult, storeResult, cashResult, laundryResult] =
        await Promise.all([
          getReservationStats(token || undefined),
          getGuestStats(token || undefined),
          getStoreStats(token || undefined),
          getCashStats(token || undefined),
          getLaundryStats(token || undefined),
        ]);

      const newStats: DashboardStats = {
        reservations: reservationsResult.success
          ? reservationsResult.data
          : defaultStats.reservations,
        guests: guestsResult.success ? guestsResult.data : defaultStats.guests,
        store: storeResult.success ? storeResult.data : defaultStats.store,
        cash: cashResult.success ? cashResult.data : defaultStats.cash,
        laundry: laundryResult.success ? laundryResult.data : defaultStats.laundry,
      };

      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

