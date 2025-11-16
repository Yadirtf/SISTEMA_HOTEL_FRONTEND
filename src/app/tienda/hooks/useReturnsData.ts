import { useEffect, useState, useCallback } from "react";
import { getReturns } from "@/services/returns";
import { getToken } from "@/lib/session";
import type { Return } from "../types";

export function useReturnsData() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReturns = useCallback(async (filters?: {
    saleId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getReturns(filters, token);
      if (resp.success && resp.data) {
        setReturns(resp.data);
      }
    } catch (error) {
      console.error('[useReturnsData] Error al cargar devoluciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  return { returns, loading, loadReturns };
}

