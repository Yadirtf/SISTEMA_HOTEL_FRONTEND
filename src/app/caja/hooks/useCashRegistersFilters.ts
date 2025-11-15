import { useEffect, useMemo, useState } from "react";
import { CashRegister } from "../types";

type UseCashRegistersFiltersProps = {
  cashRegisters: CashRegister[];
  statusFilter: string;
};

export function useCashRegistersFilters({ cashRegisters, statusFilter }: UseCashRegistersFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredCashRegisters = useMemo(() => {
    return cashRegisters.filter((cashRegister) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && cashRegister.status === "open") ||
        (statusFilter === "closed" && cashRegister.status === "closed") ||
        (statusFilter === "suspended" && cashRegister.status === "suspended");

      const matchesSearch = !searchQuery || searchQuery.trim() === "" ||
        cashRegister.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cashRegister.userId.toString().includes(searchQuery);

      return matchesStatus && matchesSearch;
    });
  }, [cashRegisters, statusFilter, searchQuery]);

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

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

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


