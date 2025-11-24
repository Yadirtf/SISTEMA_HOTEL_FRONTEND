import { useState, useCallback } from "react";
import { createLaundryService, updateLaundryService, completeLaundryService, cancelLaundryService } from "@/services/laundry-services";
import { getToken } from "@/lib/session";
import type { LaundryService, LaundryServiceFormData, CompleteLaundryServiceFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useLaundryServicesActions(
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadServices: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LaundryServiceFormData>({
    roomId: "",
    items: [],
    notes: "",
    paymentStatus: 'pending',
    paymentMethodId: undefined,
    paymentTypeId: undefined,
  });
  const [completeFormData, setCompleteFormData] = useState<CompleteLaundryServiceFormData>({
    paymentMethodId: "",
  });

  const resetForm = useCallback(() => {
    setFormData({
      roomId: "",
      items: [],
      notes: "",
      paymentStatus: 'pending',
      paymentMethodId: undefined,
      paymentTypeId: undefined,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof LaundryServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCompleteFormChange = useCallback((field: keyof CompleteLaundryServiceFormData, value: any) => {
    setCompleteFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { garmentId: "", quantity: 1 }],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const updateItem = useCallback((index: number, field: 'garmentId' | 'quantity', value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((service: LaundryService) => {
    setSelectedServiceId(service._id || null);
    setFormData({
      roomId: typeof service.roomId === 'string' ? service.roomId : service.roomId._id,
      items: service.items.map(item => ({
        garmentId: typeof item.garmentId === 'string' ? item.garmentId : (item.garmentId as any)?._id || '',
        quantity: item.quantity,
      })),
      notes: service.notes || "",
      paymentStatus: (service as any).paymentStatus || 'pending',
      paymentMethodId: service.paymentMethodId || undefined,
      paymentTypeId: (service as any).paymentTypeId || undefined,
    });
    setIsModalOpen(true);
  }, []);

  const openCompleteModal = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCompleteFormData({ paymentMethodId: "" });
    setIsCompleteModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const closeCompleteModal = useCallback(() => {
    setIsCompleteModalOpen(false);
    setSelectedServiceId(null);
    setCompleteFormData({ paymentMethodId: "" });
  }, []);

  const handleSubmit = useCallback(async () => {
    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    if (!formData.roomId) {
      showNotification("error", "Error", "La habitación es requerida");
      return;
    }

    // Validar campos de pago si está pagado
    if (formData.paymentStatus === 'paid') {
      if (!formData.paymentMethodId) {
        showNotification("error", "Error", "El método de pago es requerido cuando el servicio está pagado");
        return;
      }
      if (!formData.paymentTypeId) {
        showNotification("error", "Error", "El tipo de pago es requerido cuando el servicio está pagado");
        return;
      }
    }

    if (formData.items.length === 0) {
      showNotification("error", "Error", "Debe agregar al menos una prenda");
      return;
    }

    const validItems = formData.items.filter(item => item.garmentId && item.quantity > 0);
    if (validItems.length === 0) {
      showNotification("error", "Error", "Debe agregar prendas válidas");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedServiceId) {
        // Solo se puede actualizar las notas si el servicio está pendiente
        const resp = await updateLaundryService(selectedServiceId, { notes: formData.notes }, token);
        if (resp.success) {
          showNotification("success", "Servicio actualizado", resp.message);
          await reloadServices();
          closeModal();
        } else {
          showNotification("error", "Error al actualizar", resp.message);
        }
      } else {
        const resp = await createLaundryService({ ...formData, items: validItems }, token);
        if (resp.success) {
          showNotification("success", "Servicio creado", resp.message);
          await reloadServices();
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
  }, [selectedServiceId, formData, showNotification, reloadServices, closeModal]);

  const handleComplete = useCallback(async () => {
    if (!selectedServiceId) return;

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    if (!completeFormData.paymentMethodId) {
      showNotification("error", "Error", "El método de pago es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await completeLaundryService(selectedServiceId, completeFormData, token);
      if (resp.success) {
        showNotification("success", "Servicio completado y pagado", resp.message);
        await reloadServices();
        closeCompleteModal();
      } else {
        showNotification("error", "Error al completar", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedServiceId, completeFormData, showNotification, reloadServices, closeCompleteModal]);

  const handleCancel = useCallback(async (serviceId: string) => {
    if (!confirm("¿Estás seguro de cancelar este servicio?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    try {
      const resp = await cancelLaundryService(serviceId, token);
      if (resp.success) {
        showNotification("success", "Servicio cancelado", resp.message);
        await reloadServices();
      } else {
        showNotification("error", "Error al cancelar", resp.message);
      }
    } catch (error: any) {
      showNotification("error", "Error", error.message || "Error inesperado");
    }
  }, [showNotification, reloadServices]);

  return {
    isModalOpen,
    isCompleteModalOpen,
    selectedServiceId,
    isSubmitting,
    formData,
    completeFormData,
    handleFormChange,
    handleCompleteFormChange,
    addItem,
    removeItem,
    updateItem,
    openCreateModal,
    openEditModal,
    openCompleteModal,
    closeModal,
    closeCompleteModal,
    handleSubmit,
    handleComplete,
    handleCancel,
  };
}

