"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { formatPrice, parseFormattedPrice } from "@/lib/format";
import { getToken } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { ReservationModal, ReservationFormData } from "@/components/reservas/ReservationModal";
import { RoomDetailsModal } from "@/components/reservas/RoomDetailsModal";
import { ReservationDetailsModal } from "@/components/reservas/ReservationDetailsModal";
import { RoomsTab } from "@/app/reservas/components/RoomsTab";
import { BillingTab } from "@/app/reservas/components/BillingTab";
import { useReservationsData } from "@/app/reservas/hooks/useReservationsData";
import { useReservationActions } from "@/app/reservas/hooks/useReservationActions";
import type { Room } from "@/app/reservas/types";
import { InlineNotice } from "@/components/common/InlineNotice";

export default function ReservasPage() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0);
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
  const getRoomTypeName = useCallback((room: Room): string => {
    return typeof room.roomType === "object" && room.roomType ? (room.roomType as any).tipo : "Tipo desconocido";
  }, []);

  const getFloorNumber = useCallback((room: Room): number => {
    if (!room.floor) return 0;
    if (typeof room.floor === "object" && (room.floor as any).numero) return (room.floor as any).numero;
    const f = floors.find(f => f._id === room.floor);
    return f?.numero || 0;
  }, [floors]);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

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
      handleOpenReservationModal(room);
    } else {
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

  return (
    <DashboardShell title="Reservas">
      <Box>
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
        <Box>
          <Flex
            gap={0}
            borderBottom="2px solid"
            borderColor={colors.border}
            mb={6}
            flexWrap="wrap"
          >
            {[
              { id: 0, label: "Habitaciones" },
              { id: 1, label: "Facturación" },
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
                {tab.label}
              </Button>
            ))}
          </Flex>

          {/* Contenido de las pestañas */}
          {activeTab === 0 && (
            <RoomsTab
              rooms={rooms}
              floors={floors}
              loading={loading}
              roomsByFloor={roomsByFloor}
              sortedFloors={sortedFloors}
              colors={colors}
              onSeeDetails={onSeeDetails}
              onSeeReservationDetails={onSeeReservationDetails}
              onPrimaryAction={onPrimaryAction}
              isSubmitting={isSubmitting}
              loadRooms={loadRooms}
            />
          )}

          {activeTab === 1 && (
            <BillingTab
              showNotification={showNotification}
              onCheckoutSuccess={async () => {
                await loadRooms();
              }}
            />
          )}
        </Box>

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
              onCheckoutSuccess={async () => {
                await loadRooms();
                showNotification("success", "Check-out realizado", "La habitación ha sido liberada y los productos fiados han sido pagados");
              }}
            />
          </>
        )}

      </Box>
    </DashboardShell>
  );
}
