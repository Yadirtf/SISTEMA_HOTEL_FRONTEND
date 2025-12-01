"use client";

import { Box, Text, Flex, Stack, Button, Badge, Spinner, Textarea, Icon } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import type { BillingDetails as BillingDetailsType } from "../services/billing";
import { getPaymentMethods, getPaymentTypes, PaymentMethod, PaymentType } from "@/services/payment-methods";
import { getToken } from "@/lib/session";
import {
  FiInfo,
  FiUser,
  FiShoppingCart,
  FiDollarSign,
  FiCreditCard,
  FiMessageCircle,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

interface BillingDetailsProps {
  billingDetails: BillingDetailsType | null;
  loading: boolean;
  isProcessingCheckout: boolean;
  onCheckout: (paymentMethodId: string | undefined, paymentTypeId: string | undefined, additionalCharges: number, notes?: string) => void;
  onGenerateInvoice: () => void;
  isGeneratingInvoice: boolean;
  onOpenInvoice?: () => void;
}

export function BillingDetails({
  billingDetails,
  loading,
  isProcessingCheckout,
  onCheckout,
  onGenerateInvoice,
  isGeneratingInvoice,
  onOpenInvoice,
}: BillingDetailsProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [paymentTypeId, setPaymentTypeId] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<string>('0');
  const [notes, setNotes] = useState('');

  // Inicializar paymentMethodId y paymentTypeId desde la reserva si ya están pagados
  useEffect(() => {
    if (billingDetails?.reservation) {
      const reservation = billingDetails.reservation;
      // Si la reserva ya tiene método de pago guardado, usarlo
      const paymentMethod = (reservation as any).paymentMethodId || (reservation as any).paymentMethod;
      if (paymentMethod) {
        const methodId = typeof paymentMethod === 'string' 
          ? paymentMethod 
          : (paymentMethod as any)?._id || paymentMethod;
        if (methodId && !paymentMethodId) {
          setPaymentMethodId(methodId);
        }
      }
      // Si la reserva ya tiene tipo de pago guardado, usarlo
      const paymentType = (reservation as any).paymentTypeId || (reservation as any).paymentType;
      if (paymentType) {
        const typeId = typeof paymentType === 'string' 
          ? paymentType 
          : (paymentType as any)?._id || paymentType;
        if (typeId && !paymentTypeId) {
          setPaymentTypeId(typeId);
        }
      }
    }
  }, [billingDetails?.reservation, paymentMethodId, paymentTypeId]);

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const [methodsResp, typesResp] = await Promise.all([
          getPaymentMethods(false, token),
          getPaymentTypes(false, token),
        ]);
        if (methodsResp.success && methodsResp.data) {
          setPaymentMethods(methodsResp.data);
        }
        if (typesResp.success && typesResp.data) {
          setPaymentTypes(typesResp.data);
        }
      } catch (error) {
        console.error("Error loading payment data:", error);
      }
    };
    loadPaymentData();
  }, [token]);

  if (loading) {
    return (
      <Box
        bg={colors.surface}
        p={8}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={colors.border}
        textAlign="center"
      >
        <Spinner size="xl" color={colors.gold} />
        <Text color={colors.text} mt={4}>Cargando detalles...</Text>
      </Box>
    );
  }

  if (!billingDetails) {
    return (
      <Box
        bg={colors.surface}
        p={8}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={colors.border}
        textAlign="center"
      >
        <Text color={colors.subtext} fontSize="lg">
          Selecciona una reserva para ver los detalles
        </Text>
      </Box>
    );
  }

  const { 
    reservation, 
    pendingSales, 
    pendingSalesTotal, 
    totalToPay,
    pendingLaundryServices = [],
    pendingLaundryServicesTotal = 0,
  } = billingDetails;
  const guest = typeof reservation.guest === 'object' ? reservation.guest : null;
  const room = typeof reservation.room === 'object' ? reservation.room : null;

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "No definida";
    const d = new Date(date);
    return d.toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Formato de 12 horas con AM/PM
    });
  };

  const isOverdue = reservation.checkOutTime && new Date(reservation.checkOutTime) <= new Date();

  return (
    <Box
      bg={colors.surface}
      p={6}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      maxH="calc(100vh - 200px)"
      overflowY="auto"
    >
      <Stack gap={6}>
        {/* Encabezado */}
        <Box pb={4} borderBottom="2px solid" borderColor={colors.border}>
          <Flex justify="space-between" align="center" mb={2}>
            <Flex align="center" gap={2} color={colors.gold}>
              <Icon as={FiInfo} />
              <Text fontSize="xl" fontWeight="bold">
                Detalles de Facturación
              </Text>
            </Flex>
            {isOverdue && (
              <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full">
                Vencida
              </Badge>
            )}
          </Flex>
          <Text fontSize="sm" color={colors.subtext}>
            Habitación {reservation.roomNumber}
          </Text>
        </Box>

        {/* Información del huésped */}
        {guest && (
          <Box>
            <Flex align="center" gap={2} color={colors.gold} mb={3}>
              <Icon as={FiUser} />
              <Text fontSize="md" fontWeight="bold">
                Información del Huésped
              </Text>
            </Flex>
            <Stack gap={2}>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Nombre:</Text>
                <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                  {guest.firstName} {guest.lastName}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Documento:</Text>
                <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                  {guest.documentNumber}
                </Text>
              </Flex>
              {guest.phoneNumber && (
                <Flex justify="space-between">
                  <Text fontSize="sm" color={colors.subtext}>Teléfono:</Text>
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    {guest.phoneNumber}
                  </Text>
                </Flex>
              )}
            </Stack>
          </Box>
        )}

        {/* Detalles de la reserva */}
        <Box>
          <Flex align="center" gap={2} color={colors.gold} mb={3}>
            <Icon as={FiInfo} />
            <Text fontSize="md" fontWeight="bold">
              Detalles de la Reserva
            </Text>
          </Flex>
          <Stack gap={2}>
            <Flex justify="space-between">
              <Text fontSize="sm" color={colors.subtext}>Fecha de Entrada:</Text>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                {formatDate(reservation.checkInTime)}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="sm" color={colors.subtext}>Fecha de Salida:</Text>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                {formatDate(reservation.checkOutTime)}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="sm" color={colors.subtext}>Número de Huéspedes:</Text>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                {reservation.numberOfGuests || 1}
              </Text>
            </Flex>
          </Stack>
        </Box>

        {/* Productos fiados */}
        {pendingSales.length > 0 && (
          <Box>
            <Flex align="center" gap={2} color={colors.gold} mb={3}>
              <Icon as={FiShoppingCart} />
              <Text fontSize="md" fontWeight="bold">
                Productos Fiados ({pendingSales.length})
              </Text>
            </Flex>
            <Box
              maxH="200px"
              overflowY="auto"
              bg={colors.bg}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Stack gap={2}>
                {pendingSales.map((sale) => (
                  <Box key={sale._id} pb={2} borderBottom="1px solid" borderColor={colors.border}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color={colors.subtext}>
                        {new Date(sale.saleDate).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true, // Formato de 12 horas con AM/PM
                        })}
                      </Text>
                      <Badge colorScheme="orange" fontSize="xs">Fiado</Badge>
                    </Flex>
                    <Text fontSize="xs" color={colors.text} mb={1}>
                      {sale.items.length} producto(s)
                    </Text>
                    <Text fontSize="sm" color={colors.gold} fontWeight="bold">
                      ${formatPrice(sale.total)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Servicios de lavandería pendientes */}
        {pendingLaundryServices.length > 0 && (
          <Box>
            <Flex align="center" gap={2} color={colors.gold} mb={3}>
              <Icon as={FiShoppingCart} />
              <Text fontSize="md" fontWeight="bold">
                Servicios de Lavandería ({pendingLaundryServices.length})
              </Text>
            </Flex>
            <Box
              maxH="200px"
              overflowY="auto"
              bg={colors.bg}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Stack gap={2}>
                {pendingLaundryServices.map((service) => (
                  <Box key={service._id} pb={2} borderBottom="1px solid" borderColor={colors.border}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color={colors.subtext}>
                        {service.createdAt 
                          ? new Date(service.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'N/A'}
                      </Text>
                      <Badge colorScheme="orange" fontSize="xs">Fiado</Badge>
                    </Flex>
                    <Text fontSize="xs" color={colors.text} mb={1}>
                      {service.serviceNumber} - {service.items.length} prenda(s)
                    </Text>
                    <Text fontSize="sm" color={colors.gold} fontWeight="bold">
                      ${formatPrice(service.totalAmount)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Desglose de pagos */}
        <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.border}>
          <Flex align="center" gap={2} color={colors.gold} mb={3}>
            <Icon as={FiDollarSign} />
            <Text fontSize="md" fontWeight="bold">
              Desglose de Pagos
            </Text>
          </Flex>
          <Stack gap={2}>
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color={colors.subtext}>Precio Habitación:</Text>
                <Badge colorScheme={reservation.isPaid ? "green" : "orange"} fontSize="xs">
                  {reservation.isPaid ? "Pagado" : "Pendiente"}
                </Badge>
              </Flex>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                ${formatPrice(reservation.roomPrice || 0)}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color={colors.subtext}>Productos Fiados:</Text>
                <Badge colorScheme={pendingSales.length > 0 ? "orange" : "green"} fontSize="xs">
                  {pendingSales.length > 0 ? "Pendiente" : "Pagado"}
                </Badge>
              </Flex>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                ${formatPrice(pendingSalesTotal)}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color={colors.subtext}>Servicios de Lavandería:</Text>
                <Badge colorScheme={pendingLaundryServices.length > 0 ? "orange" : "green"} fontSize="xs">
                  {pendingLaundryServices.length > 0 ? "Pendiente" : "Pagado"}
                </Badge>
              </Flex>
              <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                ${formatPrice(pendingLaundryServicesTotal)}
              </Text>
            </Flex>
            <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor={colors.border}>
              <Text fontSize="lg" color={colors.text} fontWeight="bold">Total a Pagar:</Text>
              <Text fontSize="xl" color={colors.gold} fontWeight="bold">
                ${formatPrice(totalToPay)}
              </Text>
            </Flex>
          </Stack>
        </Box>

        {/* Formulario de checkout - Mostrar siempre si la reserva está checked_in o confirmed */}
        {(reservation.status === 'checked_in' || reservation.status === 'confirmed') && (
          <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.gold}>
            <Flex align="center" gap={2} color={colors.gold} mb={3}>
              <Icon as={FiCreditCard} />
              <Text fontSize="md" fontWeight="bold">
                {reservation.isPaid && pendingSales.length === 0 && pendingLaundryServices.length === 0
                  ? "Check-out y Facturación"
                  : reservation.isPaid && (pendingSales.length > 0 || pendingLaundryServices.length > 0)
                  ? "Pagar Servicios Pendientes" 
                  : "Proceso de Pago"}
              </Text>
            </Flex>
            {reservation.isPaid && pendingSales.length === 0 && pendingLaundryServices.length === 0 && (
              <Text fontSize="sm" color={colors.subtext} mb={3} fontStyle="italic">
                La habitación ya está pagada. Puedes generar la factura y realizar el check-out para liberar la habitación.
              </Text>
            )}
            {reservation.isPaid && (pendingSales.length > 0 || pendingLaundryServices.length > 0) && (
              <Text fontSize="sm" color={colors.subtext} mb={3} fontStyle="italic">
                La habitación ya está pagada. Estás pagando los servicios pendientes (productos fiados y/o servicios de lavandería).
              </Text>
            )}
            <Stack gap={3}>
              {/* Mostrar campos de pago solo si hay algo pendiente de pagar */}
              {(!reservation.isPaid || pendingSales.length > 0 || pendingLaundryServices.length > 0) && (
                <>
                  <Box>
                    <Flex align="center" gap={2} mb={2}>
                      <Icon as={FiCreditCard} color={colors.text} />
                      <Flex align="center" gap={1}>
                        <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                          Método de Pago
                        </Text>
                        <Text as="span" color="red.500" fontWeight="bold">
                          *
                        </Text>
                      </Flex>
                    </Flex>
                    <select
                      value={paymentMethodId}
                      onChange={(e) => setPaymentMethodId(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: `2px solid ${colors.border}`,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>Seleccionar método de pago</option>
                      {paymentMethods.map((method) => (
                        <option key={method._id} value={method._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                          {method.icon ? `${method.icon} ` : ""}{method.name}
                        </option>
                      ))}
                    </select>
                  </Box>

                  <Box>
                    <Flex align="center" gap={2} mb={2}>
                      <Icon as={FiDollarSign} color={colors.text} />
                      <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                        Tipo de Pago
                      </Text>
                    </Flex>
                    <select
                      value={paymentTypeId}
                      onChange={(e) => setPaymentTypeId(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: `2px solid ${colors.border}`,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>Seleccionar tipo de pago</option>
                      {paymentTypes.map((type) => (
                        <option key={type._id} value={type._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                </>
              )}

              <Box>
                <Flex align="center" gap={2} mb={2}>
                  <Icon as={FiDollarSign} color={colors.text} />
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    Cargos Adicionales
                  </Text>
                </Flex>
                <input
                  type="number"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: `2px solid ${colors.border}`,
                    fontSize: '14px',
                  }}
                />
              </Box>

              <Box>
                <Flex align="center" gap={2} mb={2}>
                  <Icon as={FiMessageCircle} color={colors.text} />
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    Notas
                  </Text>
                </Flex>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                  bg={colors.surface}
                  borderColor={colors.border}
                  color={colors.text}
                  resize="vertical"
                />
              </Box>

              <Flex gap={2} mt={2}>
                <Button
                  flex={1}
                  bg={colors.gold}
                  color={colors.bg}
                  fontWeight="bold"
                  _hover={{ bg: "#b8941f" }}
                  onClick={() => {
                    if (onOpenInvoice) {
                      onOpenInvoice();
                    } else {
                      onGenerateInvoice();
                    }
                  }}
                  disabled={isGeneratingInvoice}
                >
                  <Flex align="center" gap={2} justify="center">
                    <Icon as={FiFileText} />
                    <Text>{isGeneratingInvoice ? "Generando..." : "Generar Factura"}</Text>
                  </Flex>
                </Button>
                <Button
                  flex={1}
                  bg={colors.gold}
                  color={colors.bg}
                  fontWeight="bold"
                  _hover={{ bg: "#b8941f" }}
                  onClick={() => {
                    // Si la reserva ya está pagada y tiene paymentMethodId guardado, usarlo
                    const reservationPaymentMethod = (reservation as any).paymentMethodId || (reservation as any).paymentMethod;
                    const finalPaymentMethodId = paymentMethodId || 
                      (reservationPaymentMethod 
                        ? (typeof reservationPaymentMethod === 'string' 
                            ? reservationPaymentMethod 
                            : (reservationPaymentMethod as any)?._id || reservationPaymentMethod)
                        : undefined);
                    
                    const reservationPaymentType = (reservation as any).paymentTypeId || (reservation as any).paymentType;
                    const finalPaymentTypeId = paymentTypeId || 
                      (reservationPaymentType 
                        ? (typeof reservationPaymentType === 'string' 
                            ? reservationPaymentType 
                            : (reservationPaymentType as any)?._id || reservationPaymentType)
                        : undefined);
                    
                    onCheckout(finalPaymentMethodId, finalPaymentTypeId, parseFloat(additionalCharges) || 0, notes.trim() || undefined);
                  }}
                  disabled={isProcessingCheckout || ((!reservation.isPaid || pendingSales.length > 0 || pendingLaundryServices.length > 0) && !paymentMethodId && !(reservation as any).paymentMethodId && !(reservation as any).paymentMethod)}
                >
                  <Flex align="center" gap={2} justify="center">
                    <Icon as={FiCheckCircle} />
                    <Text>
                      {isProcessingCheckout 
                        ? "Procesando..." 
                        : reservation.isPaid && (pendingSales.length > 0 || pendingLaundryServices.length > 0)
                        ? "Pagar Servicios Pendientes"
                        : "Realizar Check-out"}
                    </Text>
                  </Flex>
                </Button>
              </Flex>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

