import { useState, useCallback } from "react";
import { createCategory, updateCategory, deleteCategory, toggleCategoryActive } from "@/services/categories";
import { getToken } from "@/lib/session";
import type { Category, CategoryFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useCategoriesActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadCategories: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "",
    isActive: true,
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      color: "",
      isActive: true,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((category: Category) => {
    setEditingId(category._id || null);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      color: category.color || "",
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

    setIsSubmitting(true);
    try {
      if (editingId) {
        const resp = await updateCategory(editingId, formData, token);
        if (resp.success) {
          showNotification("success", "Categoría actualizada", resp.message);
          await reloadCategories();
          closeModal();
        } else {
          showNotification("error", "Error al actualizar", resp.message);
        }
      } else {
        const resp = await createCategory(formData, token);
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

  const handleDelete = useCallback(async (category: Category) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await deleteCategory(category._id!, token);
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

  const handleToggleActive = useCallback(async (category: Category) => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await toggleCategoryActive(category._id!, token);
      if (resp.success) {
        showNotification("success", "Estado actualizado", resp.message);
        await reloadCategories();
      } else {
        showNotification("error", "Error", resp.message);
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
    handleToggleActive,
  };
}

