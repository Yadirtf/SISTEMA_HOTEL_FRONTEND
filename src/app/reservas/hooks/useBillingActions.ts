"use client";

import { useState } from "react";
import { checkOutReservation, type CheckOutData } from "@/services/reservations";
import { getToken } from "@/lib/session";

type NotificationType = "success" | "error" | "info";

export function useBillingActions(
  token: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  onCheckoutSuccess?: () => Promise<void>
) {
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const handleCheckout = async (
    reservationId: string,
    paymentMethodId: string | undefined,
    paymentTypeId: string | undefined,
    additionalCharges: number = 0,
    notes?: string
  ) => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) {
      showNotification("error", "Error", "No hay sesión activa");
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const checkoutData: CheckOutData = {
        paymentMethodId,
        paymentTypeId,
        additionalCharges,
        notes: notes?.trim() || undefined,
      };

      const resp = await checkOutReservation(reservationId, checkoutData, currentToken);
      if (resp.success) {
        showNotification("success", "Check-out realizado", "La habitación ha sido liberada y los productos fiados han sido pagados");
        if (onCheckoutSuccess) {
          await onCheckoutSuccess();
        }
      } else {
        showNotification("error", "Error al realizar check-out", resp.message || "Error desconocido");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error inesperado al realizar el check-out";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleGenerateInvoice = async (reservationId: string) => {
    setIsGeneratingInvoice(true);
    try {
      // Por ahora solo retornamos los datos, la generación de PDF se puede hacer después
      // Aquí podrías llamar a un endpoint que genere el PDF o simplemente preparar los datos
      showNotification("info", "Factura", "La funcionalidad de generación de factura se implementará próximamente");
    } catch (error: any) {
      showNotification("error", "Error", "Error al generar la factura");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return {
    isProcessingCheckout,
    isGeneratingInvoice,
    handleCheckout,
    handleGenerateInvoice,
  };
}

