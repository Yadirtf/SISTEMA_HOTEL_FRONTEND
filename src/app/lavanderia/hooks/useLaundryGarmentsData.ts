import { useEffect, useState, useCallback } from "react";
import { getLaundryGarments } from "@/services/laundry-garments";
import { getToken } from "@/lib/session";
import type { LaundryGarment } from "../types";

export function useLaundryGarmentsData(categoryId?: string, includeInactive?: boolean) {
  const [garments, setGarments] = useState<LaundryGarment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGarments = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getLaundryGarments(categoryId, includeInactive, token);
      if (resp.success && resp.data) {
        setGarments(resp.data);
      }
    } catch (error) {
      console.error('[useLaundryGarmentsData] Error al cargar prendas:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, includeInactive]);

  useEffect(() => {
    loadGarments();
  }, [loadGarments]);

  return { garments, loading, loadGarments };
}

