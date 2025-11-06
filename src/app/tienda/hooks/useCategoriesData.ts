import { useEffect, useState, useCallback } from "react";
import { getCategories } from "@/services/categories";
import { getToken } from "@/lib/session";
import type { Category } from "../types";

export function useCategoriesData(includeInactive?: boolean) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getCategories(includeInactive, token);
      if (resp.success && resp.data) {
        setCategories(resp.data);
      }
    } catch (error) {
      console.error('[useCategoriesData] Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, loadCategories };
}

