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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | undefined>(undefined);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [saleTotal, setSaleTotal] = useState<number>(0);

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

  // Calcular el total de la venta (necesario para el modal de pago)
  const calculateTotal = useCallback((items: SaleItem[], products: any[]) => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return sum;
      return sum + product.salePrice * item.quantity;
    }, 0);
  }, []);

  // Función que se llama cuando se hace clic en "Registrar Venta"
  // Abre el modal de pago si es una venta pagada, o registra directamente si es fiada
  const handleSubmit = useCallback(async (products: any[]) => {
    if (items.length === 0) {
      showNotification("error", "Error", "Debes agregar al menos un producto");
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    // Si es una venta fiada, registrar directamente sin modal de pago
    if (isCreditSale && selectedReservationId) {
      setIsSubmitting(true);
      try {
        const formData: SaleFormData = {
          items,
          notes: undefined,
          reservationId: selectedReservationId,
          paymentStatus: 'pending',
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
      return;
    }

    // Si es una venta pagada, abrir el modal de pago
    const total = calculateTotal(items, products);
    setSaleTotal(total);
    setIsPaymentModalOpen(true);
  }, [items, selectedReservationId, isCreditSale, showNotification, reloadSales, closeModal, calculateTotal]);

  // Función que se llama cuando se confirma el pago en el modal
  const handleConfirmPayment = useCallback(async (amountReceived: number, paymentMethodId?: string, paymentTypeId?: string) => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      setIsPaymentModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: SaleFormData = {
        items,
        notes: undefined,
        reservationId: selectedReservationId,
        paymentStatus: 'paid',
        amountReceived: amountReceived,
        paymentMethodId: paymentMethodId,
        paymentTypeId: paymentTypeId,
      };
      console.log('[useSalesActions] Registrando venta con datos:', {
        items: items.length,
        paymentMethodId,
        paymentTypeId,
        amountReceived,
        paymentStatus: 'paid'
      });
      const resp = await createSale(formData, token);
      if (resp.success) {
        showNotification("success", "Venta registrada", resp.message);
        await reloadSales();
        setIsPaymentModalOpen(false);
        closeModal();
      } else {
        showNotification("error", "Error al registrar venta", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [items, selectedReservationId, showNotification, reloadSales, closeModal]);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  return {
    isModalOpen,
    isPaymentModalOpen,
    isSubmitting,
    items,
    selectedReservationId,
    isCreditSale,
    saleTotal,
    setSelectedReservationId,
    setIsCreditSale,
    openModal,
    closeModal,
    addItem,
    removeItem,
    updateItemQuantity,
    handleSubmit,
    handleConfirmPayment,
    closePaymentModal,
    resetForm,
  };
}

