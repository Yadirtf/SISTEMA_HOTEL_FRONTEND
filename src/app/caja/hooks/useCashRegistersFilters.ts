import { useEffect, useMemo, useState } from "react";
import { CashRegister } from "../types";

type UseCashRegistersFiltersProps = {
  cashRegisters: CashRegister[];
  statusFilter: string;
  userIdFilter: string;
  startDateFilter: string;
  endDateFilter: string;
};

export function useCashRegistersFilters({ 
  cashRegisters, 
  statusFilter,
  userIdFilter,
  startDateFilter,
  endDateFilter,
}: UseCashRegistersFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredCashRegisters = useMemo(() => {
    return cashRegisters.filter((cashRegister) => {
      // Filtro por estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && cashRegister.status === "open") ||
        (statusFilter === "closed" && cashRegister.status === "closed") ||
        (statusFilter === "suspended" && cashRegister.status === "suspended");

      // Filtro por búsqueda
      const matchesSearch = !searchQuery || searchQuery.trim() === "" ||
        cashRegister.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cashRegister.userId.toString().includes(searchQuery);

      // Filtro por recepcionista
      const matchesUserId = userIdFilter === "all" || 
        cashRegister.userId.toString() === userIdFilter;

      // Filtro por fecha de apertura
      let matchesStartDate = true;
      if (startDateFilter) {
        const openedAt = new Date(cashRegister.openedAt);
        const startDate = new Date(startDateFilter);
        startDate.setHours(0, 0, 0, 0);
        matchesStartDate = openedAt >= startDate;
      }

      // Filtro por fecha de cierre
      let matchesEndDate = true;
      if (endDateFilter) {
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        
        // Si la caja está cerrada, usar fecha de cierre
        if (cashRegister.closedAt) {
          const closedAt = new Date(cashRegister.closedAt);
          matchesEndDate = closedAt <= endDate;
        } else {
          // Si no está cerrada, usar fecha de apertura
          const openedAt = new Date(cashRegister.openedAt);
          matchesEndDate = openedAt <= endDate;
        }
      }

      return matchesStatus && matchesSearch && matchesUserId && matchesStartDate && matchesEndDate;
    });
  }, [cashRegisters, statusFilter, searchQuery, userIdFilter, startDateFilter, endDateFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCashRegisters.length / itemsPerPage);

  const paginatedCashRegisters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCashRegisters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCashRegisters, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const hasFilters = searchQuery.trim() !== "" || 
    statusFilter !== "all" || 
    userIdFilter !== "all" ||
    startDateFilter !== "" ||
    endDateFilter !== "";

  return {
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    filteredCashRegisters,
    paginatedCashRegisters,
    totalPages,
    itemsPerPage,
    hasFilters,
  };
}
