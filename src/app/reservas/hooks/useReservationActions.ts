"use client";

import { useState } from "react";
import { getActiveReservationByRoom, createReservation } from "@/services/reservations";
import { updateRoomStatus } from "@/services/rooms";
import { getSessionUser } from "@/lib/session";
import type { Room } from "@/app/reservas/types";

export function useReservationActions(token: string | undefined, showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isRoomDetailsModalOpen, setIsRoomDetailsModalOpen] = useState(false);
  const [isReservationDetailsModalOpen, setIsReservationDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);

  const handleOpenReservationModal = (room: Room) => {
    if (room.status !== "available") {
      showNotification("error", "Error", "Esta habitación no está disponible para ocupar");
      return;
    }
    setSelectedRoom(room);
    setIsReservationModalOpen(true);
  };

  const handleOpenRoomDetailsModal = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomDetailsModalOpen(true);
  };

  const handleOpenReservationDetailsModal = async (room: Room) => {
    setSelectedRoom(room);
    setIsLoadingReservation(true);
    setIsReservationDetailsModalOpen(true);
    try {
      const resp = await getActiveReservationByRoom(room.number, token);
      if (resp.success && resp.data) {
        setSelectedReservation(resp.data);
      } else {
        showNotification("info", "Sin reserva activa", "Esta habitación no tiene una reserva activa actualmente");
        setSelectedReservation(null);
      }
    } catch (e) {
      showNotification("error", "Error", "No se pudo cargar la información de la reserva");
      setSelectedReservation(null);
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const handleCloseModals = () => {
    setIsReservationModalOpen(false);
    setIsRoomDetailsModalOpen(false);
    setIsReservationDetailsModalOpen(false);
    setSelectedRoom(null);
    setSelectedReservation(null);
  };

  const handleSubmitReservation = async (room: Room, reservationData: any, reloadRooms: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      const user = getSessionUser();
      if (!user) {
        showNotification("error", "Error", "No se encontró la sesión del usuario");
        return;
      }
      const resp = await createReservation(reservationData, token);
      if (resp.success) {
        showNotification("success", "Reserva creada", "La habitación ha sido ocupada exitosamente");
        handleCloseModals();
        await reloadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al crear la reserva");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al crear la reserva";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRoomStatus = async (room: Room, newStatus: string, reloadRooms: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      const user = getSessionUser();
      if (!user) {
        showNotification("error", "Error", "No se encontró la sesión del usuario");
        return;
      }
      const resp = await updateRoomStatus(room.number, newStatus, token);
      if (resp.success) {
        const statusMessages: Record<string, string> = {
          occupied: "Habitación ocupada",
          cleaning: "Habitación liberada, ahora está en limpieza",
          available: "Limpieza finalizada, habitación disponible",
        };
        showNotification("success", "Estado actualizado", statusMessages[newStatus] || "Estado actualizado correctamente");
        await reloadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al actualizar el estado de la habitación");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al actualizar el estado";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // state
    selectedRoom,
    selectedReservation,
    isReservationModalOpen,
    isRoomDetailsModalOpen,
    isReservationDetailsModalOpen,
    isSubmitting,
    isLoadingReservation,
    // actions
    handleOpenReservationModal,
    handleOpenRoomDetailsModal,
    handleOpenReservationDetailsModal,
    handleCloseModals,
    handleSubmitReservation,
    handleChangeRoomStatus,
    setSelectedRoom,
  };
}


