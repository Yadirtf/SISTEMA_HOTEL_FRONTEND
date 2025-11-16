import { useState, useCallback } from "react";
import { createReturn } from "@/services/returns";
import { getSales } from "@/services/sales";
import { getToken } from "@/lib/session";
import type { ReturnFormData, Sale, ReturnItem } from "../types";

type NotificationType = "success" | "error" | "info";

export function useReturnsActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadReturns: () => Promise<void>,
  reloadSalesStats?: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [refundMethodId, setRefundMethodId] = useState<string>("");
  const [availableSales, setAvailableSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedSaleId("");
    setSelectedSale(null);
    setItems([]);
    setReason("");
    setNotes("");
    setRefundMethodId("");
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    loadAvailableSales();
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const loadAvailableSales = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoadingSales(true);
    try {
      const resp = await getSales(100, token); // Cargar últimas 100 ventas
      if (resp.success && resp.data) {
        // Filtrar solo ventas pagadas
        const paidSales = resp.data.filter(sale => sale.paymentStatus === 'paid');
        setAvailableSales(paidSales);
      }
    } catch (error) {
      console.error('[useReturnsActions] Error al cargar ventas:', error);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const handleSaleSelect = useCallback((saleId: string) => {
    setSelectedSaleId(saleId);
    const sale = availableSales.find(s => s._id === saleId);
    setSelectedSale(sale || null);
    // Inicializar items vacíos
    setItems([]);
  }, [availableSales]);

  const addItem = useCallback((productId: string, quantity: number) => {
    if (!selectedSale) return;

    const saleItem = selectedSale.items.find(item => item.product === productId);
    if (!saleItem) return;

    // Verificar que no se devuelva más de lo vendido
    const existingItem = items.find(item => item.productId === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentQuantity + quantity;

    if (totalQuantity > saleItem.quantity) {
      showNotification("error", "Error", `No se pueden devolver ${totalQuantity} unidades. Solo se vendieron ${saleItem.quantity} unidades.`);
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { productId, quantity }];
    });
  }, [selectedSale, items, showNotification]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if (!selectedSale) return;
    const saleItem = selectedSale.items.find(item => item.product === productId);
    if (!saleItem) return;

    if (quantity > saleItem.quantity) {
      showNotification("error", "Error", `No se pueden devolver ${quantity} unidades. Solo se vendieron ${saleItem.quantity} unidades.`);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [selectedSale, removeItem, showNotification]);

  const handleSubmit = useCallback(async () => {
    if (!selectedSaleId) {
      showNotification("error", "Error", "Debes seleccionar una venta");
      return;
    }

    if (items.length === 0) {
      showNotification("error", "Error", "Debes agregar al menos un producto a devolver");
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: ReturnFormData = {
        saleId: selectedSaleId,
        items,
        reason: reason || undefined,
        notes: notes || undefined,
        refundMethodId: refundMethodId || undefined,
      };

      const resp = await createReturn(formData, token);
      if (resp.success) {
        showNotification("success", "Devolución procesada", resp.message);
        await reloadReturns();
        // Recargar estadísticas de ventas para que se actualicen con las devoluciones
        if (reloadSalesStats) {
          await reloadSalesStats();
        }
        closeModal();
      } else {
        showNotification("error", "Error al procesar devolución", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSaleId, items, reason, notes, refundMethodId, showNotification, reloadReturns, reloadSalesStats, closeModal]);

  return {
    isModalOpen,
    isSubmitting,
    selectedSaleId,
    selectedSale,
    items,
    reason,
    notes,
    refundMethodId,
    availableSales,
    loadingSales,
    setSelectedSaleId: handleSaleSelect,
    setReason,
    setNotes,
    setRefundMethodId,
    addItem,
    removeItem,
    updateItemQuantity,
    openModal,
    closeModal,
    handleSubmit,
  };
}

