import { useMemo, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { Company } from "../types";

type UseCompaniesFiltersProps = {
  companies: Company[];
  statusFilter: string;
};

export function useCompaniesFilters({ companies, statusFilter }: UseCompaniesFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");


  // Filtrar empresas según los filtros seleccionados
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Filtro por estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && company.status === "active") ||
        (statusFilter === "inactive" && company.status === "inactive");

      // Filtro por búsqueda
      const matchesSearch = !searchQuery || searchQuery.trim() === "" ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.nit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.contact && company.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [companies, statusFilter, searchQuery]);

  // Determinar si hay filtros activos
  const hasFilters = useMemo((): boolean => {
    return statusFilter !== "all" || !!(searchQuery && searchQuery.trim() !== "");
  }, [statusFilter, searchQuery]);

  // Items por página
  const itemsPerPage = 13;

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedCompanies,
  } = usePagination(filteredCompanies, itemsPerPage);

  return {
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    filteredCompanies,
    paginatedCompanies,
    totalPages,
    itemsPerPage,
    hasFilters,
  };
}

