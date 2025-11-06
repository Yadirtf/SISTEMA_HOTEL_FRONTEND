import { useState, useCallback } from "react";
import { createSale } from "@/services/sales";
import { getToken } from "@/lib/session";
import type { SaleItem, SaleFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useSalesActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadSales: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | undefined>(undefined);
  const [isCreditSale, setIsCreditSale] = useState(false);

  const resetForm = useCallback(() => {
    setItems([]);
    setSelectedReservationId(undefined);
    setIsCreditSale(false);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const addItem = useCallback((item: SaleItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const handleSubmit = useCallback(async () => {
    if (items.length === 0) {
      showNotification("error", "Error", "Debes agregar al menos un producto");
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: SaleFormData = {
        items,
        notes: undefined,
        reservationId: selectedReservationId,
        paymentStatus: isCreditSale && selectedReservationId ? 'pending' : 'paid',
      };
      const resp = await createSale(formData, token);
      if (resp.success) {
        showNotification("success", "Venta registrada", resp.message);
        await reloadSales();
        closeModal();
      } else {
        showNotification("error", "Error al registrar venta", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [items, selectedReservationId, isCreditSale, showNotification, reloadSales, closeModal]);

  return {
    isModalOpen,
    isSubmitting,
    items,
    selectedReservationId,
    isCreditSale,
    setSelectedReservationId,
    setIsCreditSale,
    openModal,
    closeModal,
    addItem,
    removeItem,
    updateItemQuantity,
    handleSubmit,
    resetForm,
  };
}

