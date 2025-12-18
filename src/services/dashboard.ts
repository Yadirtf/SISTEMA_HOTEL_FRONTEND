import { apiGet, Caja } from "@/lib/api";

export interface ReservationStats {
  totalReservations: number;
  confirmedReservations: number;
  checkedInReservations: number;
  checkedOutReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  averageStayDuration: number;
}

export interface GuestStats {
  totalGuests: number;
  activeGuests: number;
  inactiveGuests: number;
  blacklistedGuests: number;
  newGuestsThisMonth: number;
}

export interface StoreStats {
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  averageSale: number;
  todaySales: number;
  todayProfit: number;
  todayCount: number;
  totalReturns?: number;
  todayReturns?: number;
}

export interface CashStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  incomeByPaymentMethod: Record<string, number>;
  totalCashIncome: number;
  totalTransferIncome: number;
}

export interface LaundryStats {
  totalServices: number;
  pendingServices: number;
  inProgressServices: number;
  completedServices: number;
  cancelledServices: number;
  totalRevenue: number;
  todayServices: number;
  todayRevenue: number;
}

export interface DashboardStats {
  reservations: ReservationStats;
  guests: GuestStats;
  store: StoreStats;
  cash: CashStats;
  laundry: LaundryStats;
}

export async function getReservationStats(token?: string): Promise<Caja<ReservationStats>> {
  return apiGet<ReservationStats>("/reservations/stats", token);
}

export async function getGuestStats(token?: string): Promise<Caja<GuestStats>> {
  return apiGet<GuestStats>("/reservations/guests/stats", token);
}

export async function getStoreStats(token?: string): Promise<Caja<StoreStats>> {
  return apiGet<StoreStats>("/store/sales/stats", token);
}

export async function getCashStats(token?: string): Promise<Caja<CashStats>> {
  return apiGet<CashStats>("/cash-transactions/stats", token);
}

// Laundry stats will be calculated from services
export async function getLaundryStats(token?: string): Promise<Caja<LaundryStats>> {
  // Since there's no dedicated stats endpoint, we'll calculate from services
  const { getLaundryServices } = await import("./laundry-services");
  const servicesResult = await getLaundryServices({}, token);
  
  if (!servicesResult.success || !servicesResult.data) {
    return {
      success: false,
      message: servicesResult.message || "Error al obtener servicios de lavandería",
      data: {
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
  }

  const services = servicesResult.data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats: LaundryStats = {
    totalServices: services.length,
    pendingServices: services.filter(s => s.status === "pending").length,
    inProgressServices: 0, // Laundry services don't have in_progress status
    completedServices: services.filter(s => s.status === "completed").length,
    cancelledServices: services.filter(s => s.status === "cancelled").length,
    totalRevenue: services
      .filter(s => s.status === "completed")
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    todayServices: services.filter(s => {
      if (!s.createdAt) return false;
      const serviceDate = new Date(s.createdAt);
      return serviceDate >= today;
    }).length,
    todayRevenue: services
      .filter(s => {
        if (!s.createdAt) return false;
        const serviceDate = new Date(s.createdAt);
        return serviceDate >= today && s.status === "completed";
      })
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  };

  return {
    success: true,
    data: stats,
  };
}

