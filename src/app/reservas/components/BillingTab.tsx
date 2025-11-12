"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useBillingData } from "../hooks/useBillingData";
import { useBillingActions } from "../hooks/useBillingActions";
import { BillingList } from "./BillingList";
import { BillingDetails } from "./BillingDetails";
import { InvoiceModal } from "./InvoiceModal";
import { getToken } from "@/lib/session";
import type { Reservation } from "../types";

interface BillingTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
  onCheckoutSuccess?: () => Promise<void>;
  initialReservationId?: string | null;
  onInitialReservationProcessed?: () => void;
}

export function BillingTab({ showNotification, onCheckoutSuccess, initialReservationId, onInitialReservationProcessed }: BillingTabProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const {
    filteredReservations,
    billingDetails,
    loading,
    loadingDetails,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loadBillingDetails,
    reload,
  } = useBillingData(token);

  const {
    isProcessingCheckout,
    isGeneratingInvoice,
    handleCheckout,
    handleGenerateInvoice,
  } = useBillingActions(token, showNotification, async () => {
    if (onCheckoutSuccess) {
      await onCheckoutSuccess();
    }
    await reload();
    // Recargar los detalles de facturación de la reserva seleccionada después del checkout
    if (selectedReservation?._id) {
      await loadBillingDetails(selectedReservation._id);
      // Abrir automáticamente el modal de factura después del checkout exitoso
      setIsInvoiceModalOpen(true);
    }
  });

  const handleSelectReservation = useCallback(async (reservation: Reservation) => {
    console.log('[BillingTab] Seleccionando reserva:', reservation);
    setSelectedReservation(reservation);
    if (reservation._id) {
      console.log('[BillingTab] ID de reserva:', reservation._id);
      await loadBillingDetails(reservation._id);
    } else {
      console.error('[BillingTab] La reserva no tiene _id:', reservation);
    }
  }, [loadBillingDetails]);

  const handleCheckoutClick = useCallback(async (
    paymentMethodId: string | undefined,
    paymentTypeId: string | undefined,
    additionalCharges: number,
    notes?: string
  ) => {
    if (!selectedReservation?._id) return;
    await handleCheckout(selectedReservation._id, paymentMethodId, paymentTypeId, additionalCharges, notes);
  }, [selectedReservation, handleCheckout]);

  // Seleccionar automáticamente una reserva cuando se proporciona initialReservationId
  useEffect(() => {
    if (initialReservationId && filteredReservations.length > 0) {
      const reservation = filteredReservations.find(r => r._id === initialReservationId);
      if (reservation && (!selectedReservation || selectedReservation._id !== initialReservationId)) {
        handleSelectReservation(reservation);
        // Notificar que se procesó la reserva inicial para limpiar el estado
        if (onInitialReservationProcessed) {
          onInitialReservationProcessed();
        }
      }
    }
  }, [initialReservationId, filteredReservations, selectedReservation, handleSelectReservation, onInitialReservationProcessed]);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" color={colors.gold} mb={6}>
        Facturación y Conciliación
      </Text>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Columna izquierda - Lista de reservas */}
        <Box flex={{ base: 1, lg: "0 0 40%" }}>
          <BillingList
            reservations={filteredReservations}
            loading={loading}
            selectedReservationId={selectedReservation?._id || null}
            onSelectReservation={handleSelectReservation}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </Box>

        {/* Columna derecha - Detalles */}
        <Box flex={{ base: 1, lg: "0 0 60%" }}>
          <BillingDetails
            billingDetails={billingDetails}
            loading={loadingDetails}
            isProcessingCheckout={isProcessingCheckout}
            onCheckout={handleCheckoutClick}
            onGenerateInvoice={() => {
              if (selectedReservation?._id) {
                handleGenerateInvoice(selectedReservation._id);
              }
            }}
            isGeneratingInvoice={isGeneratingInvoice}
            onOpenInvoice={() => setIsInvoiceModalOpen(true)}
          />
        </Box>
      </Flex>

      {/* Modal de factura */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        billingDetails={billingDetails}
      />
    </Box>
  );
}

