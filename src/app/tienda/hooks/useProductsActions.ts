import { useState, useCallback } from "react";
import { createProduct, updateProduct, deleteProduct, toggleProductActive, updateProductStock } from "@/services/products";
import { getToken } from "@/lib/session";
import type { Product, ProductFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useProductsActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadProducts: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    barcode: "",
    name: "",
    purchasePrice: 0,
    salePrice: 0,
    stock: 0,
    category: undefined,
    description: "",
    isActive: true,
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      barcode: "",
      name: "",
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      category: undefined,
      description: "",
      isActive: true,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((product: Product) => {
    setEditingId(product._id || null);
    const categoryId = typeof product.category === 'object' && product.category !== null
      ? product.category._id
      : product.category || undefined;
    
    setFormData({
      barcode: product.barcode || "",
      name: product.name || "",
      purchasePrice: product.purchasePrice || 0,
      salePrice: product.salePrice || 0,
      stock: product.stock || 0,
      category: categoryId,
      description: product.description || "",
      isActive: product.isActive ?? true,
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
        const resp = await updateProduct(editingId, formData, token);
        if (resp.success) {
          showNotification("success", "Producto actualizado", resp.message);
          await reloadProducts();
          closeModal();
        } else {
          showNotification("error", "Error al actualizar", resp.message);
        }
      } else {
        const resp = await createProduct(formData, token);
        if (resp.success) {
          showNotification("success", "Producto creado", resp.message);
          await reloadProducts();
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
  }, [editingId, formData, showNotification, reloadProducts, closeModal]);

  const handleDelete = useCallback(async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await deleteProduct(product._id!, token);
      if (resp.success) {
        showNotification("success", "Producto eliminado", resp.message);
        await reloadProducts();
      } else {
        showNotification("error", "Error al eliminar", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadProducts]);

  const handleToggleActive = useCallback(async (product: Product) => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await toggleProductActive(product._id!, token);
      if (resp.success) {
        showNotification("success", "Estado actualizado", resp.message);
        await reloadProducts();
      } else {
        showNotification("error", "Error", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadProducts]);

  const handleUpdateStock = useCallback(async (productId: string, stock: number, notes?: string) => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await updateProductStock(productId, stock, notes, token);
      if (resp.success) {
        showNotification("success", "Stock actualizado", resp.message);
        await reloadProducts();
      } else {
        showNotification("error", "Error al actualizar stock", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadProducts]);

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
    handleUpdateStock,
  };
}

