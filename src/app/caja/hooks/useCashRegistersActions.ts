import { useState, useCallback } from "react";
import { 
  createCashRegister, 
  updateCashRegister, 
  closeCashRegister, 
  suspendCashRegister, 
  resumeCashRegister,
  getCashRegisterStats
} from "@/services/cash-registers";
import { CashRegister, CashRegisterFormData, CloseCashRegisterFormData, CashRegisterStats } from "../types";
import type { NotificationType } from "@/hooks/useNotifications";

export function useCashRegistersActions(
  token: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadCashRegisters: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expectedBalance, setExpectedBalance] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<CashRegisterStats | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
  });
  const [formData, setFormData] = useState<CashRegisterFormData>({
    registerNumber: "",
    userId: 0,
    initialAmount: 0,
    notes: "",
  });
  const [closeFormData, setCloseFormData] = useState<CloseCashRegisterFormData>({
    actualBalance: 0,
    closingNotes: "",
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      registerNumber: "",
      userId: 0,
      initialAmount: 0,
      notes: "",
    });
  }, []);

  const resetCloseForm = useCallback(() => {
    setClosingId(null);
    setExpectedBalance(undefined);
    setCloseFormData({
      actualBalance: 0,
      closingNotes: "",
    });
  }, []);

  const handleFormChange = useCallback((field: keyof CashRegisterFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCloseFormChange = useCallback((field: keyof CloseCashRegisterFormData, value: any) => {
    setCloseFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(async () => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback(async (cashRegister: CashRegister) => {
    setEditingId(cashRegister._id);
    setFormData({
      registerNumber: cashRegister.registerNumber,
      userId: cashRegister.userId,
      initialAmount: cashRegister.initialAmount,
      notes: cashRegister.notes || "",
    });
    setIsModalOpen(true);
  }, []);

  const openCloseModal = useCallback(async (cashRegister: CashRegister) => {
    setClosingId(cashRegister._id);
    try {
      // Obtener estadísticas para calcular saldo esperado
      const statsResp = await getCashRegisterStats(cashRegister._id, token);
      if (statsResp.success && statsResp.data) {
        const expected = cashRegister.initialAmount + statsResp.data.totalIncome - statsResp.data.totalExpense;
        setExpectedBalance(expected);
        setStats(statsResp.data);
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      // Calcular saldo esperado básico
      setExpectedBalance(cashRegister.currentBalance);
    }
    setIsCloseModalOpen(true);
  }, [token]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const closeCloseModal = useCallback(() => {
    setIsCloseModalOpen(false);
    resetCloseForm();
  }, [resetCloseForm]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);

    if (!formData.registerNumber || formData.registerNumber.trim() === "") {
      showNotification("error", "Error", "El número de caja es requerido");
      setIsSubmitting(false);
      return;
    }
    if (!formData.userId || formData.userId <= 0) {
      showNotification("error", "Error", "Debe seleccionar un recepcionista");
      setIsSubmitting(false);
      return;
    }
    if (!formData.initialAmount || formData.initialAmount <= 0) {
      showNotification("error", "Error", "El monto inicial debe ser mayor a 0");
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = editingId
        ? await updateCashRegister(editingId, formData, token)
        : await createCashRegister(formData, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Caja actualizada" : "Caja abierta",
          resp.message || "Operación exitosa"
        );
        closeModal();
        await reloadCashRegisters();
      } else {
        showNotification("error", "Error", resp.message || "Error al guardar");
      }
    } catch (e: any) {
      console.error("Error al guardar caja:", e);
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingId, token, showNotification, closeModal, reloadCashRegisters]);

  const submitClose = useCallback(async () => {
    if (!closingId) return;

    setIsSubmitting(true);

    if (!closeFormData.actualBalance || closeFormData.actualBalance < 0) {
      showNotification("error", "Error", "El saldo físico contado debe ser mayor o igual a 0");
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = await closeCashRegister(closingId, closeFormData, token);

      if (resp.success) {
        showNotification("success", "Caja cerrada", resp.message || "Caja cerrada exitosamente");
        closeCloseModal();
        await reloadCashRegisters();
      } else {
        showNotification("error", "Error", resp.message || "Error al cerrar caja");
      }
    } catch (e: any) {
      console.error("Error al cerrar caja:", e);
      showNotification("error", "Error", e?.message || "Error desconocido al cerrar caja");
    } finally {
      setIsSubmitting(false);
    }
  }, [closingId, closeFormData, token, showNotification, closeCloseModal, reloadCashRegisters]);

  const handleSuspend = useCallback((cashRegister: CashRegister) => {
    setConfirmDialog({
      isOpen: true,
      title: "Suspender Caja",
      message: `¿Estás seguro de suspender la caja ${cashRegister.registerNumber}?`,
      variant: "warning",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const resp = await suspendCashRegister(cashRegister._id, token);
          if (resp.success) {
            showNotification("success", "Caja suspendida", resp.message || "Caja suspendida exitosamente");
            await reloadCashRegisters();
          } else {
            showNotification("error", "Error", resp.message || "Error al suspender caja");
          }
        } catch (e: any) {
          console.error("Error al suspender caja:", e);
          showNotification("error", "Error", e?.message || "Error desconocido al suspender caja");
        }
      },
    });
  }, [token, showNotification, reloadCashRegisters]);

  const handleResume = useCallback((cashRegister: CashRegister) => {
    setConfirmDialog({
      isOpen: true,
      title: "Reanudar Caja",
      message: `¿Estás seguro de reanudar la caja ${cashRegister.registerNumber}?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const resp = await resumeCashRegister(cashRegister._id, token);
          if (resp.success) {
            showNotification("success", "Caja reanudada", resp.message || "Caja reanudada exitosamente");
            await reloadCashRegisters();
          } else {
            showNotification("error", "Error", resp.message || "Error al reanudar caja");
          }
        } catch (e: any) {
          console.error("Error al reanudar caja:", e);
          showNotification("error", "Error", e?.message || "Error desconocido al reanudar caja");
        }
      },
    });
  }, [token, showNotification, reloadCashRegisters]);

  const handleViewStats = useCallback(async (cashRegister: CashRegister) => {
    try {
      // El nuevo modal carga las estadísticas internamente
      setSelectedCashRegister(cashRegister);
      setStatsModalOpen(true);
      // También cargamos las estadísticas para mantener compatibilidad
      const resp = await getCashRegisterStats(cashRegister._id, token);
      if (resp.success && resp.data) {
        setStats(resp.data);
      }
    } catch (e: any) {
      console.error("Error al obtener estadísticas:", e);
      // No mostramos error porque el modal puede cargar los datos internamente
    }
  }, [token]);

  return {
    isModalOpen,
    isCloseModalOpen,
    editingId,
    closingId,
    isSubmitting,
    formData,
    closeFormData,
    expectedBalance,
    stats,
    statsModalOpen,
    selectedCashRegister,
    confirmDialog,
    handleFormChange,
    handleCloseFormChange,
    openCreateModal,
    openEditModal,
    openCloseModal,
    closeModal,
    closeCloseModal,
    submit,
    submitClose,
    handleSuspend,
    handleResume,
    handleViewStats,
    closeStatsModal: () => {
      setStatsModalOpen(false);
      setSelectedCashRegister(null);
    },
    closeConfirmDialog: () => {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    },
  };
}


