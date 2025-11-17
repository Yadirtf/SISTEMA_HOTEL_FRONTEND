import { useState, useCallback } from "react";
import { createCashTransaction } from "@/services/cash-transactions";
import { getToken } from "@/lib/session";
import type { CashTransactionFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useExpensesActions(
  cashRegisterId: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadExpenses: () => Promise<void>,
  onExpenseRegistered?: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CashTransactionFormData>>({
    transactionType: "expense",
    transactionCategory: "expense",
    amount: 0,
    description: "",
    notes: "",
  });

  const resetForm = useCallback(() => {
    setFormData({
      transactionType: "expense",
      transactionCategory: "expense",
      amount: 0,
      description: "",
      notes: "",
    });
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleFormChange = useCallback(
    (field: keyof CashTransactionFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!cashRegisterId) {
      showNotification("error", "Error", "No se ha identificado la caja");
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      showNotification("error", "Error", "La descripción es requerida");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      showNotification("error", "Error", "El monto debe ser mayor a 0");
      return;
    }

    const token = getToken() || undefined;
    if (!token) {
      showNotification("error", "Error", "No se encontró el token de autenticación");
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData: CashTransactionFormData = {
        cashRegisterId,
        transactionType: "expense",
        transactionCategory: formData.transactionCategory || "expense",
        amount: formData.amount || 0,
        description: formData.description.trim(),
        notes: formData.notes?.trim() || undefined,
      };

      const resp = await createCashTransaction(transactionData, token);
      if (resp.success) {
        showNotification("success", "Éxito", "Egreso registrado correctamente");
        await reloadExpenses();
        // Recargar información de la caja para actualizar el saldo actual
        if (onExpenseRegistered) {
          await onExpenseRegistered();
        }
        closeModal();
      } else {
        showNotification("error", "Error", resp.message || "Error al registrar el egreso");
      }
    } catch (error: any) {
      console.error("[useExpensesActions] Error al registrar egreso:", error);
      showNotification("error", "Error", error?.message || "Error desconocido al registrar el egreso");
    } finally {
      setIsSubmitting(false);
    }
  }, [cashRegisterId, formData, showNotification, reloadExpenses, closeModal, onExpenseRegistered]);

  return {
    isModalOpen,
    isSubmitting,
    formData,
    openModal,
    closeModal,
    handleFormChange,
    handleSubmit,
  };
}

