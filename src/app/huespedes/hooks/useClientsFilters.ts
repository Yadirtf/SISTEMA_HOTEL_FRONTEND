import { useEffect, useMemo, useState } from "react";
import { Client } from "../types";

type UseClientsFiltersProps = {
  clients: Client[];
  statusFilter: string;
  clientTypeFilter: string;
};

export function useClientsFilters({ clients, statusFilter, clientTypeFilter }: UseClientsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Items por página según si hay filtros
  const itemsPerPage = hasFilters ? 10 : 15;

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, clientTypeFilter, searchQuery]);

  // Obtener los clientes de la página actual
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, itemsPerPage]);

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

