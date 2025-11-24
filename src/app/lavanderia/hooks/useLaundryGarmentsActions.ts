import { useState, useCallback } from "react";
import { createLaundryGarment, updateLaundryGarment, deleteLaundryGarment } from "@/services/laundry-garments";
import { getToken } from "@/lib/session";
import type { LaundryGarment, LaundryGarmentFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useLaundryGarmentsActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadGarments: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LaundryGarmentFormData>({
    name: "",
    categoryId: "",
    isActive: true,
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      name: "",
      categoryId: "",
      isActive: true,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof LaundryGarmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((garment: LaundryGarment) => {
    setEditingId(garment._id || null);
    const categoryId = typeof garment.categoryId === 'string' 
      ? garment.categoryId 
      : (garment.categoryId as any)?._id || '';
    setFormData({
      name: garment.name || "",
      categoryId: categoryId,
      isActive: garment.isActive ?? true,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    if (!formData.name.trim()) {
      showNotification("error", "Error", "El nombre es requerido");
      return;
    }

    if (!formData.categoryId) {
      showNotification("error", "Error", "La categoría es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const resp = await updateLaundryGarment(editingId, formData, token);
        if (resp.success) {
          showNotification("success", "Prenda actualizada", resp.message);
          await reloadGarments();
          closeModal();
        } else {
          showNotification("error", "Error al actualizar", resp.message);
        }
      } else {
        const resp = await createLaundryGarment(formData, token);
        if (resp.success) {
          showNotification("success", "Prenda creada", resp.message);
          await reloadGarments();
          closeModal();
        } else {
          showNotification("error", "Error al crear", resp.message);
        }
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, formData, showNotification, reloadGarments, closeModal]);

  const handleDelete = useCallback(async (garment: LaundryGarment) => {
    if (!confirm(`¿Estás seguro de eliminar la prenda "${garment.name}"?`)) {
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await deleteLaundryGarment(garment._id!, token);
      if (resp.success) {
        showNotification("success", "Prenda eliminada", resp.message);
        await reloadGarments();
      } else {
        showNotification("error", "Error al eliminar", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadGarments]);

  return {
    isModalOpen,
    editingId,
    isSubmitting,
    formData,
    handleFormChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}

