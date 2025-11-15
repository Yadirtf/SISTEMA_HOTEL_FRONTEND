"use client";

import { useState } from "react";
import { Box, Stack } from "@chakra-ui/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getToken } from "@/lib/session";
import { InlineNotice } from "@/components/common/InlineNotice";
import { PaginationControls } from "@/components/habitaciones/PaginationControls";
import { CashRegistersHeader } from "@/components/caja/CashRegistersHeader";
import { CashRegistersTable } from "@/components/caja/CashRegistersTable";
import { CashRegisterModal } from "@/components/caja/CashRegisterModal";
import { CloseCashRegisterModal } from "@/components/caja/CloseCashRegisterModal";
import { CashRegisterStatsModal } from "@/components/caja/CashRegisterStatsModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useCashRegistersData } from "./hooks/useCashRegistersData";
import { useCashRegistersFilters } from "./hooks/useCashRegistersFilters";
import { useCashRegistersActions } from "./hooks/useCashRegistersActions";

export default function CajaPage() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Hooks de utilidades
  const { hydrated, user, isAdmin } = useAuth();
  const { notification, showNotification, clearNotification } = useNotifications();

  // Hook de datos
  // Si es recepcionista, solo mostrar su propia caja
  const {
    cashRegisters,
    loading,
    loadCashRegisters,
  } = useCashRegistersData(token, {
    status: statusFilter === "all" ? undefined : statusFilter,
    userId: hydrated && isAdmin ? undefined : (hydrated ? user?.idUsuario : undefined), // Recepcionista solo ve su caja, después de hidratación
  });

  // Hook de filtros
  const {
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    filteredCashRegisters,
    paginatedCashRegisters,
    totalPages,
    itemsPerPage,
    hasFilters,
  } = useCashRegistersFilters({ cashRegisters, statusFilter });

  // Hook de acciones
  const {
    isModalOpen,
    isCloseModalOpen,
    editingId,
    isSubmitting,
    formData,
    closeFormData,
    expectedBalance,
    stats,
    statsModalOpen,
    selectedCashRegister,
    confirmDialog,
    handleFormChange,
    handleCloseFormChange,
    openCreateModal,
    openEditModal,
    openCloseModal,
    closeModal,
    closeCloseModal,
    submit,
    submitClose,
    handleSuspend,
    handleResume,
    handleViewStats,
    closeStatsModal,
    closeConfirmDialog,
  } = useCashRegistersActions(token, showNotification, loadCashRegisters);

  return (
    <DashboardShell title="Gestión de Caja">
      <Box>
        {/* Notificaciones */}
        {notification && (
          <InlineNotice
            type={notification.type}
            title={notification.title}
            description={notification.description}
            onClose={clearNotification}
            colors={colors}
          />
        )}

        <Stack gap={6}>
          {/* Header con filtros y acciones */}
          <CashRegistersHeader
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
            onRefresh={loadCashRegisters}
            onCreate={hydrated && isAdmin ? openCreateModal : undefined} // Solo admin puede abrir cajas, después de hidratación
            loading={loading}
          />

          {/* Tabla de cajas */}
          <CashRegistersTable
            cashRegisters={paginatedCashRegisters}
            loading={loading}
            hasFilters={hasFilters}
            filteredCount={filteredCashRegisters.length}
            totalCount={cashRegisters.length}
            onClose={openCloseModal}
            onSuspend={hydrated && isAdmin ? handleSuspend : undefined} // Solo admin puede suspender, después de hidratación
            onResume={hydrated && isAdmin ? handleResume : undefined} // Solo admin puede reanudar, después de hidratación
            onViewStats={handleViewStats}
            currentUserId={user?.idUsuario}
            isAdmin={hydrated && isAdmin}
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCashRegisters.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Modal de caja */}
          <CashRegisterModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={submit}
            isEditing={!!editingId}
            formData={formData}
            onFormChange={handleFormChange as (field: keyof typeof formData, value: any) => void}
            isLoading={isSubmitting}
          />

          {/* Modal de cierre de caja */}
          <CloseCashRegisterModal
            isOpen={isCloseModalOpen}
            onClose={closeCloseModal}
            onSubmit={submitClose}
            formData={closeFormData}
            onFormChange={handleCloseFormChange as (field: keyof typeof closeFormData, value: any) => void}
            isLoading={isSubmitting}
            expectedBalance={expectedBalance}
          />

          {/* Modal de estadísticas */}
          {selectedCashRegister && (
            <CashRegisterStatsModal
              isOpen={statsModalOpen}
              onClose={closeStatsModal}
              stats={stats}
              registerNumber={selectedCashRegister.registerNumber}
              initialAmount={selectedCashRegister.initialAmount}
            />
          )}

          {/* Diálogo de confirmación */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            variant={confirmDialog.variant}
            onConfirm={confirmDialog.onConfirm}
            onCancel={closeConfirmDialog}
          />
        </Stack>
      </Box>
    </DashboardShell>
  );
}

