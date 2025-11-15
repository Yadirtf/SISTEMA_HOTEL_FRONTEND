import { useEffect, useMemo, useState } from "react";
import { Company } from "../types";

type UseCompaniesFiltersProps = {
  companies: Company[];
  statusFilter: string;
};

export function useCompaniesFilters({ companies, statusFilter }: UseCompaniesFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Items por página según si hay filtros
  const itemsPerPage = hasFilters ? 10 : 15;

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / itemsPerPage));

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // Obtener las empresas de la página actual
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCompanies.slice(startIndex, endIndex);
  }, [filteredCompanies, currentPage, itemsPerPage]);

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

