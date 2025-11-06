"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getBillingActiveReservations, getBillingOverdueReservations, getBillingDetails, type BillingDetails } from "../services/billing";
import { getToken } from "@/lib/session";
import type { Reservation } from "../types";

type FilterType = 'all' | 'active' | 'overdue';

export function useBillingData(token?: string) {
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [overdueReservations, setOverdueReservations] = useState<Reservation[]>([]);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const loadActiveReservations = useCallback(async () => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) return;
    
    try {
      const resp = await getBillingActiveReservations(currentToken);
      if (resp.success && resp.data) {
        setActiveReservations(resp.data as any);
      }
    } catch (error) {
      console.error('[useBillingData] Error al cargar reservas activas:', error);
    }
  }, [token]);

  const loadOverdueReservations = useCallback(async () => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) return;
    
    try {
      const resp = await getBillingOverdueReservations(currentToken);
      if (resp.success && resp.data) {
        setOverdueReservations(resp.data as any);
      }
    } catch (error) {
      console.error('[useBillingData] Error al cargar reservas vencidas:', error);
    }
  }, [token]);

  const loadBillingDetails = useCallback(async (reservationId: string) => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) {
      console.error('[useBillingData] No hay token disponible');
      return;
    }
    
    if (!reservationId || reservationId.trim() === '') {
      console.error('[useBillingData] ID de reserva inválido:', reservationId);
      setBillingDetails(null);
      return;
    }

    // Validar que el ID tenga el formato correcto de ObjectId de MongoDB (24 caracteres hexadecimales)
    if (!/^[0-9a-fA-F]{24}$/.test(reservationId)) {
      console.error('[useBillingData] ID de reserva no tiene formato válido de ObjectId:', reservationId);
      setBillingDetails(null);
      return;
    }
    
    setLoadingDetails(true);
    try {
      console.log('[useBillingData] Cargando detalles de facturación para reserva:', reservationId);
      const resp = await getBillingDetails(reservationId, currentToken);
      if (resp.success && resp.data) {
        console.log('[useBillingData] Detalles de facturación cargados exitosamente');
        setBillingDetails(resp.data);
      } else {
        console.warn('[useBillingData] No se pudieron cargar los detalles:', resp.message);
        setBillingDetails(null);
      }
    } catch (error) {
      console.error('[useBillingData] Error al cargar detalles de facturación:', error);
      setBillingDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadActiveReservations(), loadOverdueReservations()]);
    setLoading(false);
  }, [loadActiveReservations, loadOverdueReservations]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Filtrar y buscar reservas
  const filteredReservations = useMemo(() => {
    let reservations: Reservation[] = [];
    
    if (filter === 'all') {
      reservations = [...activeReservations, ...overdueReservations];
    } else if (filter === 'active') {
      reservations = activeReservations;
    } else if (filter === 'overdue') {
      reservations = overdueReservations;
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toUpperCase();
      reservations = reservations.filter(r => 
        r.roomNumber?.toUpperCase().includes(query) ||
        (typeof r.guest === 'object' && r.guest && 
          (r.guest.documentNumber?.toUpperCase().includes(query) ||
           `${r.guest.firstName} ${r.guest.lastName}`.toUpperCase().includes(query)))
      );
    }

    return reservations;
  }, [filter, searchQuery, activeReservations, overdueReservations]);

  return {
    activeReservations,
    overdueReservations,
    filteredReservations,
    billingDetails,
    loading,
    loadingDetails,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loadBillingDetails,
    reload: loadAll,
  };
}

