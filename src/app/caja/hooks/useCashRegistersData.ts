import { useEffect, useState } from "react";
import { getCashRegisters } from "@/services/cash-registers";
import { CashRegister } from "../types";

type CashRegisterFilters = {
  status?: string;
  userId?: number;
};

export function useCashRegistersData(token: string | undefined, filters: CashRegisterFilters) {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCashRegisters = async () => {
    setLoading(true);
    try {
      const resp = await getCashRegisters(filters, token);
      if (resp.success && resp.data) {
        setCashRegisters(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar cajas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashRegisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.userId]);

  return {
    cashRegisters,
    loading,
    loadCashRegisters,
  };
}


