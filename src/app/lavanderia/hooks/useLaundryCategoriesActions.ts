import { useState, useCallback } from "react";
import { createLaundryCategory, updateLaundryCategory, deleteLaundryCategory } from "@/services/laundry-categories";
import { getToken } from "@/lib/session";
import type { LaundryCategory, LaundryCategoryFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useLaundryCategoriesActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadCategories: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LaundryCategoryFormData>({
    name: "",
    pricePerUnit: 0,
    isActive: true,
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      name: "",
      pricePerUnit: 0,
      isActive: true,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof LaundryCategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((category: LaundryCategory) => {
    setEditingId(category._id || null);
    setFormData({
      name: category.name || "",
      pricePerUnit: category.pricePerUnit || 0,
      isActive: category.isActive ?? true,
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

    if (formData.pricePerUnit <= 0) {
      showNotification("error", "Error", "El precio por unidad debe ser mayor a 0");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const resp = await updateLaundryCategory(editingId, formData, token);
        if (resp.success) {
          showNotification("success", "Categoría actualizada", resp.message);
          await reloadCategories();
          closeModal();
        } else {
          showNotification("error", "Error al actualizar", resp.message);
        }
      } else {
        const resp = await createLaundryCategory(formData, token);
        if (resp.success) {
          showNotification("success", "Categoría creada", resp.message);
          await reloadCategories();
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
  }, [editingId, formData, showNotification, reloadCategories, closeModal]);

  const handleDelete = useCallback(async (category: LaundryCategory) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await deleteLaundryCategory(category._id!, token);
      if (resp.success) {
        showNotification("success", "Categoría eliminada", resp.message);
        await reloadCategories();
      } else {
        showNotification("error", "Error al eliminar", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadCategories]);

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

