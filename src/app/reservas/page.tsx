"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { formatPrice, parseFormattedPrice } from "@/lib/format";
import { getToken } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { ReservationModal, ReservationFormData } from "@/components/reservas/ReservationModal";
import { RoomDetailsModal } from "@/components/reservas/RoomDetailsModal";
import { ReservationDetailsModal } from "@/components/reservas/ReservationDetailsModal";
import { Header } from "@/app/reservas/components/Header";
import { FloorSection } from "@/app/reservas/components/FloorSection";
import { useReservationsData } from "@/app/reservas/hooks/useReservationsData";
import { useReservationActions } from "@/app/reservas/hooks/useReservationActions";
import { statusToEs, getStatusColor as mapStatusColor } from "@/app/reservas/lib/status";
import type { Room } from "@/app/reservas/types";
import { InlineNotice } from "@/components/common/InlineNotice";

// Tipos movidos a @/app/reservas/types

export default function ReservasPage() {
  const token = getToken() || undefined;
  const { colors, mode } = useThemeMode();
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  const { rooms, floors, loading, loadRooms, roomsByFloor, sortedFloors } = useReservationsData(token);

  const {
    selectedRoom,
    selectedReservation,
    isReservationModalOpen,
    isRoomDetailsModalOpen,
    isReservationDetailsModalOpen,
    isSubmitting,
    isLoadingReservation,
    handleOpenReservationModal,
    handleOpenRoomDetailsModal,
    handleOpenReservationDetailsModal,
    handleCloseModals,
    handleSubmitReservation,
    handleChangeRoomStatus,
    setSelectedRoom,
  } = useReservationActions(token, (t, ti, d) => setNotification({ type: t, title: ti, description: d }));

  // Función helper para obtener el nombre del tipo de habitación
  const getRoomTypeName = (room: Room): string => typeof room.roomType === "object" && room.roomType ? (room.roomType as any).tipo : "Tipo desconocido";
  const getFloorNumber = (room: Room): number => {
    if (!room.floor) return 0;
    if (typeof room.floor === "object" && (room.floor as any).numero) return (room.floor as any).numero;
    const f = floors.find(f => f._id === room.floor);
    return f?.numero || 0;
  };

  // Mapa de traducción de estados
  const statusToEs: Record<string, string> = {
    available: "Disponible",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
    cleaning: "Limpieza",
  };

  // Mapa de colores para estados
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "available":
        return "#22c55e"; // Verde
      case "occupied":
        return "#ef4444"; // Rojo
      case "maintenance":
        return "#f59e0b"; // Amarillo
      case "cleaning":
        return "#3b82f6"; // Azul
      default:
        return colors.subtext;
    }
  };

  // Carga movida a useReservationsData

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  // Acciones movidas a useReservationActions

  // Acciones movidas a useReservationActions

  // Acciones movidas a useReservationActions

  // Acciones movidas a useReservationActions

  // Notificaciones movidas a la campana global

  const handleSubmitReservationForm = async (formData: ReservationFormData) => {
    if (!selectedRoom) return;
    const reservationData = {
      documentNumber: formData.documentNumber.trim().toUpperCase(),
      guestFirstName: formData.guestFirstName.trim(),
      guestLastName: formData.guestLastName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      roomNumber: selectedRoom.number,
      checkInTime: formData.checkInTime ? new Date(formData.checkInTime).toISOString() : new Date().toISOString(),
      checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime).toISOString() : undefined,
      snackConsumption: formData.snackConsumption ? parseFormattedPrice(formData.snackConsumption) : 0,
      numberOfGuests: formData.numberOfGuests ? parseInt(formData.numberOfGuests) : 1,
      specialRequests: formData.specialRequests.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      paymentMethod: formData.paymentMethod || "pending",
      email: formData.email.trim() || undefined,
      origin: formData.origin.trim() || undefined,
      profession: formData.profession.trim() || undefined,
    };
    await handleSubmitReservation(selectedRoom, reservationData, loadRooms);
  };

  const onPrimaryAction = useCallback((room: Room) => {
    if (room.status === "available") {
      // Si está disponible, abrir modal de reserva
      handleOpenReservationModal(room);
    } else {
      // Si está ocupada o en limpieza, cambiar estado
      const next = room.status === "cleaning" ? "available" : "cleaning";
      handleChangeRoomStatus(room, next, loadRooms);
    }
  }, [handleOpenReservationModal, handleChangeRoomStatus, loadRooms]);

  const onSeeDetails = useCallback((room: Room) => {
    handleOpenRoomDetailsModal(room);
  }, [handleOpenRoomDetailsModal]);

  const onSeeReservationDetails = useCallback((room: Room) => {
    handleOpenReservationDetailsModal(room);
  }, [handleOpenReservationDetailsModal]);

  // Cargas iniciales movidas al hook

  // Agrupación y orden vienen del hook

  if (loading) {
    return (
      <DashboardShell title="Reservas">
        <Flex justify="center" align="center" minH="400px">
          <Text color={colors.text}>Cargando habitaciones...</Text>
        </Flex>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Reservas">
      <Stack gap={6}>
        {/* Encabezado */}
        <Header title="Habitaciones del Hotel" subtitle="Selecciona una habitación para realizar una reserva" colors={colors} />

        {/* Habitaciones agrupadas por piso */}
        {sortedFloors.length === 0 ? (
          <Box
            bg={colors.surface}
            p={8}
            borderRadius="lg"
            borderWidth="2px"
            borderColor={colors.border}
            textAlign="center"
          >
            <Text color={colors.subtext} fontSize="lg">
              No hay habitaciones disponibles
            </Text>
          </Box>
        ) : (
          <Stack gap={8}>
            {sortedFloors.map((floorNum) => (
              <FloorSection
                key={floorNum}
                floorNum={floorNum}
                rooms={roomsByFloor[floorNum]}
                colors={colors}
                statusToEs={statusToEs}
                getStatusColor={(s) => mapStatusColor(s, colors.subtext)}
                formatPrice={(n) => formatPrice(n)}
                onSeeDetails={onSeeDetails}
                onSeeReservationDetails={onSeeReservationDetails}
                onPrimaryAction={onPrimaryAction}
                primaryEnabled={(room) => true}
                isBusy={isSubmitting}
              />
            ))}
          </Stack>
        )}

        {/* Modales */}
        {selectedRoom && (
          <>
            <ReservationModal
              isOpen={isReservationModalOpen}
              onClose={handleCloseModals}
              onSubmit={handleSubmitReservationForm}
              roomNumber={selectedRoom.number}
              roomPrice={selectedRoom.pricePerNight}
              roomType={typeof selectedRoom.roomType === 'object' && selectedRoom.roomType !== null ? selectedRoom.roomType : null}
              isLoading={isSubmitting}
            />
            <RoomDetailsModal
              isOpen={isRoomDetailsModalOpen}
              onClose={handleCloseModals}
              room={selectedRoom}
              getRoomTypeName={getRoomTypeName}
              getFloorNumber={getFloorNumber}
            />
            <ReservationDetailsModal
              isOpen={isReservationDetailsModalOpen}
              onClose={handleCloseModals}
              reservation={selectedReservation}
              isLoading={isLoadingReservation}
            />
          </>
        )}

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
