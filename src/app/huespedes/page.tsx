"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Stack, Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { FiUsers, FiBriefcase } from "react-icons/fi";
import { useState, useCallback } from "react";
import { getToken } from "@/lib/session";
import { ClientModal } from "@/components/clientes/ClientModal";
import { CompaniesModal } from "@/components/clientes/CompaniesModal";
import { PaginationControls } from "@/components/common/PaginationControls";
import { InlineNotice } from "@/components/common/InlineNotice";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useClientsData } from "./hooks/useClientsData";
import { useClientsFilters } from "./hooks/useClientsFilters";
import { useClientsActions } from "./hooks/useClientsActions";
import { useCompaniesData } from "./hooks/useCompaniesData";
import { useCompaniesFilters } from "./hooks/useCompaniesFilters";
import { useCompaniesActions } from "./hooks/useCompaniesActions";
import { ClientsHeader } from "@/components/clientes/ClientsHeader";
import { CompaniesHeader } from "@/components/clientes/CompaniesHeader";
import { ClientsTable } from "@/components/clientes/ClientsTable";
import { CompaniesTable } from "@/components/clientes/CompaniesTable";

export default function HuespedesPage() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0); // 0 = Clientes, 1 = Empresas
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>("all");
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

  // Hook de acciones de clientes
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
    companies,
    loadingCompanies,
  } = useClientsActions(token, showNotification, loadClients);

  // Hook de datos de empresas
  const {
    companies: companiesList,
    stats: companyStats,
    loading: loadingCompaniesData,
    loadCompanies,
  } = useCompaniesData(token, {
    status: companyStatusFilter === "all" ? undefined : companyStatusFilter,
  });

  // Hook de filtros de empresas
  const {
    searchQuery: companySearchQuery,
    currentPage: companyCurrentPage,
    setSearchQuery: setCompanySearchQuery,
    setCurrentPage: setCompanyCurrentPage,
    filteredCompanies,
    paginatedCompanies,
    totalPages: companyTotalPages,
    itemsPerPage: companyItemsPerPage,
    hasFilters: companyHasFilters,
  } = useCompaniesFilters({ companies: companiesList, statusFilter: companyStatusFilter });

  // Hook de acciones de empresas
  const {
    isModalOpen: isCompanyModalOpen,
    editingId: editingCompanyId,
    isSubmitting: isSubmittingCompany,
    formData: companyFormData,
    handleFormChange: handleCompanyFormChange,
    openCreateModal: openCreateCompanyModal,
    openEditModal: openEditCompanyModal,
    closeModal: closeCompanyModal,
    submit: submitCompany,
    handleDeactivate: handleDeactivateCompany,
    handleActivate: handleActivateCompany,
    handleDeletePermanent: handleDeleteCompanyPermanent,
  } = useCompaniesActions(token, showNotification, loadCompanies);

  return (
    <DashboardShell title="Huéspedes">
      <Box>
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

        {/* Pestañas */}
        <Box mb={6}>
          <Flex
            gap={0}
            borderBottom="2px solid"
            borderColor={colors.border}
            flexWrap="wrap"
          >
            {[
              { id: 0, label: "Clientes", icon: FiUsers },
              { id: 1, label: "Empresas", icon: FiBriefcase },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                borderRadius={0}
                borderBottom={activeTab === tab.id ? "3px solid" : "none"}
                borderBottomColor={activeTab === tab.id ? colors.gold : "transparent"}
                color={activeTab === tab.id ? colors.gold : colors.subtext}
                fontWeight={activeTab === tab.id ? "bold" : "normal"}
                onClick={() => setActiveTab(tab.id)}
                _hover={{
                  bg: colors.surface,
                  color: colors.gold,
                }}
                px={6}
                py={4}
              >
                <Flex align="center" gap={2} justify="center">
                  <Icon as={tab.icon} fontSize="lg" />
                  <Text>{tab.label}</Text>
                </Flex>
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Contenido de las pestañas */}
        {activeTab === 0 && (
          <Stack gap={6}>
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
              companies={companies}
              loadingCompanies={loadingCompanies}
            />
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack gap={6}>
            {/* Header con filtros y acciones */}
            <CompaniesHeader
              statusFilter={companyStatusFilter}
              searchQuery={companySearchQuery}
              onStatusChange={setCompanyStatusFilter}
              onSearchChange={setCompanySearchQuery}
              onRefresh={loadCompanies}
              onCreate={openCreateCompanyModal}
              loading={loadingCompaniesData}
              stats={companyStats}
            />

            {/* Tabla de empresas */}
            <CompaniesTable
              companies={paginatedCompanies}
              loading={loadingCompaniesData}
              hasFilters={companyHasFilters}
              filteredCount={filteredCompanies.length}
              totalCount={companiesList.length}
              onEdit={openEditCompanyModal}
              onDeactivate={handleDeactivateCompany}
              onActivate={handleActivateCompany}
              onDelete={handleDeleteCompanyPermanent}
            />

            {/* Paginación */}
            {companyTotalPages > 1 && (
              <PaginationControls
                currentPage={companyCurrentPage}
                totalPages={companyTotalPages}
                totalItems={filteredCompanies.length}
                itemsPerPage={companyItemsPerPage}
                onPageChange={setCompanyCurrentPage}
              />
            )}

            {/* Modal de empresa */}
            <CompaniesModal
              isOpen={isCompanyModalOpen}
              onClose={closeCompanyModal}
              onSubmit={submitCompany}
              isEditing={!!editingCompanyId}
              formData={companyFormData}
              onFormChange={handleCompanyFormChange as (field: keyof typeof companyFormData, value: any) => void}
              isLoading={isSubmittingCompany}
            />
          </Stack>
        )}
      </Box>
    </DashboardShell>
  );
}
