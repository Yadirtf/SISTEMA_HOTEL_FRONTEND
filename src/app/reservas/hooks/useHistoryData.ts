"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getReservationHistory } from "../services/history";
import { getToken } from "@/lib/session";
import type { HistoryReservation } from "../types";

export function useHistoryData(token?: string) {
  const [reservations, setReservations] = useState<HistoryReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minAmountFilter, setMinAmountFilter] = useState("");
  const [maxAmountFilter, setMaxAmountFilter] = useState("");

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

  // Función auxiliar para calcular el total de una reserva
  const calculateReservationTotal = useCallback((reservation: HistoryReservation): number => {
    if (!reservation.checkOutTime) return 0;
    const checkIn = new Date(reservation.checkInTime);
    const checkOut = new Date(reservation.checkOutTime);
    const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return (reservation.roomPrice || 0) * nights;
  }, []);

  // Filtrar por todos los filtros
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filtro de búsqueda general (nombre, habitación, profesión)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toUpperCase();
      filtered = filtered.filter(r => {
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
    }

    // Filtro por habitación
    if (roomFilter.trim()) {
      const roomQuery = roomFilter.trim().toUpperCase();
      filtered = filtered.filter(r => 
        r.roomNumber?.toUpperCase().includes(roomQuery)
      );
    }

    // Filtro por profesión
    if (professionFilter.trim()) {
      const professionQuery = professionFilter.trim().toUpperCase();
      filtered = filtered.filter(r => {
        const profession = (typeof r.guest === 'object' && r.guest?.profession) 
          ? r.guest.profession.toUpperCase() 
          : "";
        return profession.includes(professionQuery);
      });
    }

    // Filtro por rango de fechas (fecha de entrada)
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => {
        const checkIn = new Date(r.checkInTime);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn >= fromDate;
      });
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => {
        const checkIn = new Date(r.checkInTime);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn <= toDate;
      });
    }

    // Filtro por rango de monto
    if (minAmountFilter) {
      const minAmount = parseFloat(minAmountFilter);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter(r => {
          const total = calculateReservationTotal(r);
          return total >= minAmount;
        });
      }
    }

    if (maxAmountFilter) {
      const maxAmount = parseFloat(maxAmountFilter);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter(r => {
          const total = calculateReservationTotal(r);
          return total <= maxAmount;
        });
      }
    }

    return filtered;
  }, [reservations, searchQuery, roomFilter, professionFilter, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter, calculateReservationTotal]);

  // Obtener lista única de habitaciones para el filtro
  const uniqueRooms = useMemo(() => {
    const rooms = new Set<string>();
    reservations.forEach(r => {
      if (r.roomNumber) {
        rooms.add(r.roomNumber);
      }
    });
    return Array.from(rooms).sort();
  }, [reservations]);

  // Obtener lista única de profesiones para el filtro
  const uniqueProfessions = useMemo(() => {
    const professions = new Set<string>();
    reservations.forEach(r => {
      if (typeof r.guest === 'object' && r.guest?.profession) {
        professions.add(r.guest.profession);
      }
    });
    return Array.from(professions).sort();
  }, [reservations]);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setRoomFilter("");
    setProfessionFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setMinAmountFilter("");
    setMaxAmountFilter("");
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery.trim() ||
      roomFilter.trim() ||
      professionFilter.trim() ||
      dateFromFilter ||
      dateToFilter ||
      minAmountFilter ||
      maxAmountFilter
    );
  }, [searchQuery, roomFilter, professionFilter, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter]);

  return {
    reservations: filteredReservations,
    loading,
    searchQuery,
    setSearchQuery,
    roomFilter,
    setRoomFilter,
    professionFilter,
    setProfessionFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    minAmountFilter,
    setMinAmountFilter,
    maxAmountFilter,
    setMaxAmountFilter,
    uniqueRooms,
    uniqueProfessions,
    hasActiveFilters,
    clearFilters,
    reload: loadHistory,
  };
}

