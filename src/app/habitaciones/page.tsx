"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Stack } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { getToken } from "@/lib/session";
import { RoomModal } from "@/components/habitaciones/RoomModal";
import { PaginationControls } from "@/components/habitaciones/PaginationControls";
import { InlineNotice } from "@/components/common/InlineNotice";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useRoomsData } from "./hooks/useRoomsData";
import { useRoomsFilters } from "./hooks/useRoomsFilters";
import { useRoomsActions } from "./hooks/useRoomsActions";
import { RoomsHeader } from "../../components/habitaciones/RoomsHeader";
import { RoomsTable } from "../../components/habitaciones/RoomsTable";
import { RoomsCardList } from "../../components/habitaciones/RoomsCardList";

export default function HabitacionesPage() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

  // Hook de datos
  const {
    rooms,
    roomTypes,
    floors,
    loading,
    loadRooms,
    getRoomTypeName,
    getFloorNumber,
  } = useRoomsData(token, statusFilter);

  // Hook de filtros
  const {
    floorFilter,
    typeFilter,
    currentPage,
    setFloorFilter,
    setTypeFilter,
    setCurrentPage,
    filteredRooms,
    paginatedRooms,
    totalPages,
    itemsPerPage,
    hasFilters,
  } = useRoomsFilters({ rooms, statusFilter });

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
    handleToggleActive,
    handleDeletePermanent,
  } = useRoomsActions(token, showNotification, roomTypes, floors, loadRooms);

  return (
    <DashboardShell title="Habitaciones">
      <Stack gap={6}>
        {/* Header con filtros y acciones */}
        <RoomsHeader
          floorFilter={floorFilter}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onFloorChange={setFloorFilter}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          roomTypes={roomTypes}
          floors={floors}
          onRefresh={loadRooms}
          onCreate={openCreateModal}
          loading={loading}
        />

        {/* Tabla de habitaciones para desktop */}
        <RoomsTable
          rooms={paginatedRooms}
          loading={loading}
          hasFilters={hasFilters}
          filteredCount={filteredRooms.length}
          totalCount={rooms.length}
          onEdit={openEditModal}
          onToggleActive={handleToggleActive}
          onDelete={handleDeletePermanent}
          getRoomTypeName={getRoomTypeName}
          getFloorNumber={getFloorNumber}
        />

        {/* Cards para móvil/tablet */}
        <RoomsCardList
          rooms={paginatedRooms}
          loading={loading}
          totalCount={rooms.length}
          onEdit={openEditModal}
          onToggleActive={handleToggleActive}
          onDelete={handleDeletePermanent}
          getRoomTypeName={getRoomTypeName}
          getFloorNumber={getFloorNumber}
        />

        {/* Controles de paginación */}
        {filteredRooms.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRooms.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal de registro/edición */}
        <RoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          isEditing={!!editingId}
          formData={formData}
          onFormChange={handleFormChange}
          isLoading={isSubmitting}
          roomTypes={roomTypes}
          floors={floors}
        />

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
      </Stack>
    </DashboardShell>
  );
}
