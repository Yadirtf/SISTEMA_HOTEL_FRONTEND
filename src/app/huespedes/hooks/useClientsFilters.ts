import { useMemo, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { Client } from "../types";

type UseClientsFiltersProps = {
  clients: Client[];
  statusFilter: string;
  clientTypeFilter: string;
};

export function useClientsFilters({ clients, statusFilter, clientTypeFilter }: UseClientsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");


  // Filtrar clientes según los filtros seleccionados
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Filtro por estado
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && client.status === "active") ||
        (statusFilter === "inactive" && client.status === "inactive") ||
        (statusFilter === "blacklisted" && client.status === "blacklisted");

      // Filtro por tipo de cliente
      const matchesClientType =
        clientTypeFilter === "all" ||
        (clientTypeFilter === "company" && client.isCompanyClient === true) ||
        (clientTypeFilter === "regular" && client.isCompanyClient === false);

      // Filtro por búsqueda
      const matchesSearch = !searchQuery || searchQuery.trim() === "" ||
        client.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phoneNumber.includes(searchQuery) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.company && client.company.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesClientType && matchesSearch;
    });
  }, [clients, statusFilter, clientTypeFilter, searchQuery]);

  // Determinar si hay filtros activos
  const hasFilters = useMemo((): boolean => {
    return statusFilter !== "active" || clientTypeFilter !== "all" || (searchQuery ? searchQuery.trim() !== "" : false);
  }, [statusFilter, clientTypeFilter, searchQuery]);

  // Items por página
  const itemsPerPage = 13;

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedClients,
  } = usePagination(filteredClients, itemsPerPage);

  return {
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    filteredClients,
    paginatedClients,
    totalPages,
    itemsPerPage,
    hasFilters,
  };
}

