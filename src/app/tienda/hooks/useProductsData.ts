import { useEffect, useState, useCallback } from "react";
import { getProducts, searchProducts, getProductsByCategory } from "@/services/products";
import { getToken } from "@/lib/session";
import type { Product } from "../types";

export function useProductsData(categoryFilter?: string, searchQuery?: string, includeInactive?: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let resp;
      if (searchQuery && searchQuery.trim().length > 0) {
        // Si hay búsqueda, buscar primero
        resp = await searchProducts(searchQuery.trim(), includeInactive, token);
        
        // Si también hay filtro de categoría, aplicar el filtro en el frontend
        if (resp.success && resp.data && categoryFilter) {
          const filtered = resp.data.filter((product) => {
            const catId = typeof product.category === "object" ? product.category?._id : product.category;
            return catId === categoryFilter;
          });
          setProducts(filtered);
          setLoading(false);
          return;
        }
      } else if (categoryFilter) {
        resp = await getProductsByCategory(categoryFilter, includeInactive, token);
      } else {
        resp = await getProducts(includeInactive, token);
      }

      if (resp.success && resp.data) {
        setProducts(resp.data);
      }
    } catch (error) {
      console.error('[useProductsData] Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchQuery, includeInactive]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, loadProducts };
}

