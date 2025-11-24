import { useEffect, useState, useCallback } from "react";
import { getLaundryCategories } from "@/services/laundry-categories";
import { getToken } from "@/lib/session";
import type { LaundryCategory } from "../types";

export function useLaundryCategoriesData(includeInactive?: boolean) {
  const [categories, setCategories] = useState<LaundryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getLaundryCategories(includeInactive, token);
      if (resp.success && resp.data) {
        setCategories(resp.data);
      }
    } catch (error) {
      console.error('[useLaundryCategoriesData] Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, loadCategories };
}

