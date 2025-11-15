"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Stack } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { getToken } from "@/lib/session";
import { ClientModal } from "@/components/clientes/ClientModal";
import { PaginationControls } from "@/components/habitaciones/PaginationControls";
import { InlineNotice } from "@/components/common/InlineNotice";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useClientsData } from "./hooks/useClientsData";
import { useClientsFilters } from "./hooks/useClientsFilters";
import { useClientsActions } from "./hooks/useClientsActions";
import { ClientsHeader } from "@/components/clientes/ClientsHeader";
import { ClientsTable } from "@/components/clientes/ClientsTable";

export default function HuespedesPage() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

  // Hook de datos
  const {
    clients,
    stats,
    loading,
    loadClients,
  } = useClientsData(token, {
    status: statusFilter === "all" ? undefined : statusFilter,
    isCompanyClient: clientTypeFilter === "all" ? undefined : clientTypeFilter === "company",
  });

  // Hook de filtros
  const {
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    filteredClients,
    paginatedClients,
    totalPages,
    itemsPerPage,
    hasFilters,
  } = useClientsFilters({ clients, statusFilter, clientTypeFilter });

  // Hook de acciones
  const {
    isModalOpen,
    editingId,
    isSubmitting,
    formData,
    handleFormChange,
    openCreateModal,
    openEditModal,
    closeModal,
    submit,
    handleDeactivate,
    handleActivate,
    handleDeletePermanent,
  } = useClientsActions(token, showNotification, loadClients);

  return (
    <DashboardShell title="Huéspedes">
      <Stack gap={6}>
        {/* Notificaciones */}
        {notification && (
          <InlineNotice
            type={notification.type}
            title={notification.title}
            description={notification.description}
            onClose={() => setNotification(null)}
            colors={colors}
          />
        )}

        {/* Header con filtros y acciones */}
        <ClientsHeader
          statusFilter={statusFilter}
          clientTypeFilter={clientTypeFilter}
          searchQuery={searchQuery}
          onStatusChange={setStatusFilter}
          onClientTypeChange={setClientTypeFilter}
          onSearchChange={setSearchQuery}
          onRefresh={loadClients}
          onCreate={openCreateModal}
          loading={loading}
          stats={stats}
        />

        {/* Tabla de clientes */}
        <ClientsTable
          clients={paginatedClients}
          loading={loading}
          hasFilters={hasFilters}
          filteredCount={filteredClients.length}
          totalCount={clients.length}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onDelete={handleDeletePermanent}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClients.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal de cliente */}
        <ClientModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          isEditing={!!editingId}
          formData={formData}
          onFormChange={handleFormChange as (field: keyof typeof formData, value: any) => void}
          isLoading={isSubmitting}
        />
      </Stack>
    </DashboardShell>
  );
}
