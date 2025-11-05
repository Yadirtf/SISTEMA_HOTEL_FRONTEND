import { useState, useEffect, useCallback } from "react";
import { createRoom, updateRoom, deleteRoomPermanent, toggleRoomActive } from "@/services/rooms";
import { Room, RoomFormData, RoomType, Floor } from "../types";

type NotificationType = "success" | "error" | "info";

export function useRoomsActions(
  token: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  roomTypes: RoomType[],
  floors: Floor[],
  reloadRooms: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RoomFormData>({
    number: "",
    roomType: "",
    pricePerNight: 0,
    floor: "",
    maxOccupancy: 1,
    description: "",
    status: "available",
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    const defaultRoomType = roomTypes.find((type) => type.isActive)?._id || "";
    const defaultFloor = floors.find((floor) => floor.isActive)?._id || "";
    setFormData({
      number: "",
      roomType: defaultRoomType,
      pricePerNight: 0,
      floor: defaultFloor,
      maxOccupancy: 1,
      description: "",
      status: "available",
    });
  }, [roomTypes, floors]);

  // Actualizar el formulario cuando se carguen los tipos y pisos
  useEffect(() => {
    if (roomTypes.length > 0 || floors.length > 0) {
      const defaultRoomType = roomTypes.find((type) => type.isActive)?._id || "";
      const defaultFloor = floors.find((floor) => floor.isActive)?._id || "";
      setFormData((prev) => {
        let updated = { ...prev };
        if (!prev.roomType || !roomTypes.find(t => t._id === prev.roomType && t.isActive)) {
          updated.roomType = defaultRoomType;
        }
        if (!prev.floor || !floors.find(f => f._id === prev.floor && f.isActive)) {
          updated.floor = defaultFloor;
        }
        return updated;
      });
    }
  }, [roomTypes, floors]);

  const handleFormChange = useCallback((field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(async () => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback(async (room: Room) => {
    setEditingId(room._id);
    const roomTypeId = typeof room.roomType === "object" && room.roomType !== null 
      ? (typeof room.roomType._id === "string" ? room.roomType._id : String(room.roomType._id))
      : String(room.roomType || "");
    const floorId = typeof room.floor === "object" && room.floor !== null 
      ? (typeof room.floor._id === "string" ? room.floor._id : String(room.floor._id))
      : String(room.floor || "");
    
    setFormData({
      number: room.number || "",
      roomType: roomTypeId || "",
      pricePerNight: room.pricePerNight || 0,
      floor: floorId || "",
      maxOccupancy: room.maxOccupancy || 1,
      description: room.description || "",
      status: (room.status as "available" | "occupied" | "maintenance" | "cleaning") || "available",
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    
    // Validar que se haya seleccionado un tipo
    if (!formData.roomType || formData.roomType === "") {
      showNotification("error", "Error", "Por favor seleccione un tipo de habitación");
      setIsSubmitting(false);
      return;
    }

    // Validar que se haya seleccionado un piso
    if (!formData.floor || formData.floor === "") {
      showNotification("error", "Error", "Por favor seleccione un piso");
      setIsSubmitting(false);
      return;
    }

    // Validar ObjectIds
    const roomTypeToSend = String(formData.roomType || "").trim();
    const floorToSend = String(formData.floor || "").trim();
    
    if (!roomTypeToSend || roomTypeToSend.length !== 24) {
      showNotification("error", "Error", "El tipo de habitación seleccionado no es válido");
      setIsSubmitting(false);
      return;
    }
    
    if (!floorToSend || floorToSend.length !== 24) {
      showNotification("error", "Error", "El piso seleccionado no es válido");
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = editingId
        ? await updateRoom(formData.number, formData, token)
        : await createRoom(formData, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Habitación actualizada" : "Habitación registrada",
          resp.message || "Operación exitosa"
        );
        closeModal();
        await reloadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al guardar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingId, token, showNotification, closeModal, reloadRooms]);

  const handleToggleActive = useCallback(async (room: Room) => {
    const isCurrentlyActive = room.isActive === true;
    const action = isCurrentlyActive ? "desactivar" : "activar";
    const actionPast = isCurrentlyActive ? "desactivada" : "activada";
    
    if (!confirm(`¿Está seguro de que desea ${action} esta habitación?`)) {
      return;
    }

    try {
      const resp = await toggleRoomActive(room.number, !isCurrentlyActive, token);
      if (resp.success) {
        showNotification("success", `Habitación ${actionPast}`);
        await reloadRooms();
      } else {
        showNotification("error", "Error", resp.message || `Error al ${action}`);
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || `Error desconocido al ${action}`);
    }
  }, [token, showNotification, reloadRooms]);

  const handleDeletePermanent = useCallback(async (room: Room) => {
    if (!confirm("⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE esta habitación? Esta acción NO se puede deshacer.")) {
      return;
    }

    try {
      const resp = await deleteRoomPermanent(room.number, token);
      if (resp.success) {
        showNotification("success", "Habitación eliminada");
        await reloadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al eliminar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  }, [token, showNotification, reloadRooms]);

  return {
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
  };
}

