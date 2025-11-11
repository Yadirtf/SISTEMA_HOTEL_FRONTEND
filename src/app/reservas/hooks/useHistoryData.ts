"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getReservationHistory } from "../services/history";
import { getToken } from "@/lib/session";
import type { HistoryReservation } from "../types";

export function useHistoryData(token?: string) {
  const [reservations, setReservations] = useState<HistoryReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = useCallback(async () => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const resp = await getReservationHistory(currentToken);
      if (resp.success && resp.data) {
        setReservations(resp.data as any);
      }
    } catch (error) {
      console.error('[useHistoryData] Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Filtrar por búsqueda
  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) {
      return reservations;
    }

    const query = searchQuery.trim().toUpperCase();
    return reservations.filter(r => {
      const guestName = r.guest 
        ? `${r.guest.firstName} ${r.guest.lastName}`.toUpperCase()
        : "";
      const roomNumber = r.roomNumber?.toUpperCase() || "";
      const profession = (typeof r.guest === 'object' && r.guest?.profession) 
        ? r.guest.profession.toUpperCase() 
        : "";
      
      return guestName.includes(query) || 
             roomNumber.includes(query) || 
             profession.includes(query);
    });
  }, [reservations, searchQuery]);

  return {
    reservations: filteredReservations,
    loading,
    searchQuery,
    setSearchQuery,
    reload: loadHistory,
  };
}

