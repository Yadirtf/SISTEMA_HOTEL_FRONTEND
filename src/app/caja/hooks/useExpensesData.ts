import { useEffect, useState, useCallback } from "react";
import { getCashTransactions } from "@/services/cash-transactions";
import { getToken } from "@/lib/session";
import type { CashTransaction } from "../types";

export function useExpensesData(cashRegisterId?: string) {
  const [expenses, setExpenses] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token || !cashRegisterId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getCashTransactions(
        {
          cashRegisterId,
          transactionType: "expense",
        },
        token
      );
      if (resp.success && resp.data) {
        // Ordenar por fecha más reciente primero
        const sorted = resp.data.sort((a, b) => {
          const dateA = new Date(a.transactionDate).getTime();
          const dateB = new Date(b.transactionDate).getTime();
          return dateB - dateA;
        });
        setExpenses(sorted);
      }
    } catch (error) {
      console.error("[useExpensesData] Error al cargar egresos:", error);
    } finally {
      setLoading(false);
    }
  }, [cashRegisterId]);

  useEffect(() => {
    if (cashRegisterId) {
      loadExpenses();
    }
  }, [loadExpenses, cashRegisterId]);

  return {
    expenses,
    loading,
    reloadExpenses: loadExpenses,
  };
}

