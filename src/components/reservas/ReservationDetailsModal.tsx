"use client";

import { Box, Button, Flex, Stack, Text, Heading, Badge, Spinner } from "@chakra-ui/react";
import { formatPrice } from "@/lib/format";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useState, useEffect } from "react";
import { getPendingSalesByReservation } from "@/services/sales";
import { getToken } from "@/lib/session";
import type { Sale } from "@/app/tienda/types";

type Guest = {
  _id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
};

type Reservation = {
  _id: string;
  guest: Guest | string;
  room: {
    _id: string;
    number: string;
    type?: string;
    floor?: number;
    pricePerNight: number;
  } | string;
  documentNumber: string;
  roomNumber: string;
  checkInTime: Date | string;
  checkOutTime?: Date | string;
  roomPrice: number;
  totalPrice: number;
  status: string;
  numberOfGuests: number;
  specialRequests?: string;
  notes?: string;
  paymentMethod?: string;
  isPaid?: boolean;
  createdAt?: Date | string;
};

type ReservationDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  isLoading?: boolean;
  onCheckoutSuccess?: () => void;
  onNavigateToBilling?: (reservationId: string) => void;
};

const statusToEs: Record<string, string> = {
  confirmed: "Confirmada",
  checked_in: "Registrada",
  checked_out: "Finalizada",
  cancelled: "Cancelada",
  no_show: "No se presentó",
};

const paymentMethodToEs: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  pending: "Pendiente",
};

export function ReservationDetailsModal({
  isOpen,
  onClose,
  reservation,
  isLoading = false,
  onCheckoutSuccess,
  onNavigateToBilling,
}: ReservationDetailsModalProps) {
  const { colors } = useThemeMode();
  const [pendingSales, setPendingSales] = useState<Sale[]>([]);
  const [loadingPendingSales, setLoadingPendingSales] = useState(false);

  // Cargar productos fiados cuando se abre el modal
  useEffect(() => {
    if (isOpen && reservation && reservation.status === 'checked_in' && reservation._id) {
      loadPendingSales();
    } else {
      setPendingSales([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reservation?._id, reservation?.status]);


  const loadPendingSales = async () => {
    if (!reservation?._id) return;
    const token = getToken();
    if (!token) return;

    setLoadingPendingSales(true);
    try {
      const resp = await getPendingSalesByReservation(reservation._id, token);
      if (resp.success && resp.data) {
        setPendingSales(resp.data);
      }
    } catch (error) {
      console.error('Error al cargar productos fiados:', error);
    } finally {
      setLoadingPendingSales(false);
    }
  };

  const handleNavigateToBilling = () => {
    if (reservation?._id && onNavigateToBilling) {
      onNavigateToBilling(reservation._id);
      onClose();
    }
  };

  const pendingSalesTotal = pendingSales.reduce((sum, sale) => sum + sale.total, 0);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.7)"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        onClick={onClose}
      >
        <Box
          bg={colors.surface}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          p={8}
          onClick={(e) => e.stopPropagation()}
        >
          <Text color={colors.text}>Cargando información de la reserva...</Text>
        </Box>
      </Box>
    );
  }

  if (!reservation) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.7)"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        onClick={onClose}
      >
        <Box
          bg={colors.surface}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
          maxW="500px"
          w="100%"
          p={6}
          onClick={(e) => e.stopPropagation()}
        >
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            pb={3}
            borderBottom="2px solid"
            borderColor={colors.border}
          >
            <Heading size="lg" color={colors.gold}>
              Sin Reserva Activa
            </Heading>
            <Button
              variant="ghost"
              onClick={onClose}
              color={colors.subtext}
              _hover={{ bg: colors.surface, color: colors.text }}
              fontSize="xl"
              p={2}
              minW="auto"
              h="auto"
            >
              ×
            </Button>
          </Flex>
          <Text color={colors.text} mb={4}>
            Esta habitación no tiene una reserva activa actualmente.
          </Text>
          <Flex justify="flex-end">
            <Button
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              onClick={onClose}
              boxShadow={`0 2px 8px ${colors.gold}50`}
            >
              Cerrar
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  }

  const guest = typeof reservation.guest === "object" ? reservation.guest : null;
  const room = typeof reservation.room === "object" ? reservation.room : null;

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

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={colors.border}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
        maxW="600px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <Flex
          justify="space-between"
          align="center"
          p={6}
          borderBottom="2px solid"
          borderColor={colors.border}
          bg={colors.bg}
        >
          <Heading size="lg" color={colors.gold}>
            Detalles de la Reserva
          </Heading>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ bg: colors.surface, color: colors.text }}
            fontSize="xl"
            p={2}
            minW="auto"
            h="auto"
          >
            ×
          </Button>
        </Flex>

        {/* Contenido */}
        <Stack gap={6} p={6}>
          {/* Estado */}
          <Box>
            <Text
              fontSize="xs"
              color={colors.subtext}
              mb={2}
              textTransform="uppercase"
              letterSpacing="0.5px"
              fontWeight="semibold"
            >
              Estado
            </Text>
            <Box
              display="inline-block"
              bg={colors.gold}
              color={colors.bg}
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              {statusToEs[reservation.status] || reservation.status}
            </Box>
          </Box>

          {/* Información del huésped */}
          {guest && (
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información del Huésped
              </Text>
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
                <Flex justify="space-between">
                  <Text fontSize="sm" color={colors.subtext}>Teléfono:</Text>
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    {guest.phoneNumber}
                  </Text>
                </Flex>
                {guest.email && (
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Email:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {guest.email}
                    </Text>
                  </Flex>
                )}
              </Stack>
            </Box>
          )}

          {/* Información de la reserva */}
          <Box>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={colors.gold}
              mb={3}
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Información de la Reserva
            </Text>
            <Stack gap={2}>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Habitación:</Text>
                <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                  #{reservation.roomNumber}
                </Text>
              </Flex>
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
                  {reservation.numberOfGuests}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Información de pago */}
          <Box>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={colors.gold}
              mb={3}
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Información de Pago
            </Text>
            <Stack gap={2}>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Precio Habitación:</Text>
                <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                  ${formatPrice(reservation.roomPrice)}
                </Text>
              </Flex>
              
              {/* Productos fiados */}
              {reservation.status === 'checked_in' && (
                <>
                  {loadingPendingSales ? (
                    <Flex justify="center" py={2}>
                      <Spinner size="sm" color={colors.gold} />
                    </Flex>
                  ) : pendingSales.length > 0 ? (
                    <Box pt={2} borderTop="1px solid" borderColor={colors.border}>
                      <Text fontSize="sm" color={colors.gold} fontWeight="semibold" mb={2}>
                        Productos Fiados ({pendingSales.length}):
                      </Text>
                      <Stack gap={1} mb={2} maxH="150px" overflowY="auto">
                        {pendingSales.map((sale) => (
                          <Box key={sale._id} p={2} bg={colors.bg} borderRadius="md" fontSize="xs">
                            <Flex justify="space-between" mb={1}>
                              <Text color={colors.subtext}>
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
                            <Text color={colors.text} fontSize="xs" mb={1}>
                              {sale.items.length} producto(s)
                            </Text>
                            <Text color={colors.gold} fontWeight="bold" fontSize="sm">
                              ${formatPrice(sale.total)}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                      <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor={colors.border}>
                        <Text fontSize="sm" color={colors.subtext}>Total Productos Fiados:</Text>
                        <Text fontSize="sm" color={colors.gold} fontWeight="bold">
                          ${formatPrice(pendingSalesTotal)}
                        </Text>
                      </Flex>
                    </Box>
                  ) : null}
                </>
              )}

              <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor={colors.border}>
                <Text fontSize="md" color={colors.text} fontWeight="bold">Total:</Text>
                <Text fontSize="lg" color={colors.gold} fontWeight="bold">
                  ${formatPrice(reservation.totalPrice + (reservation.status === 'checked_in' ? pendingSalesTotal : 0))}
                </Text>
              </Flex>
              {reservation.paymentMethod && (
                <Flex justify="space-between">
                  <Text fontSize="sm" color={colors.subtext}>Método de Pago:</Text>
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    {paymentMethodToEs[reservation.paymentMethod] || reservation.paymentMethod}
                  </Text>
                </Flex>
              )}
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Pagado:</Text>
                <Text fontSize="sm" color={reservation.isPaid ? "#22c55e" : "#ef4444"} fontWeight="semibold">
                  {reservation.isPaid ? "Sí" : "No"}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Botón de checkout (solo si está checked_in) */}
          {reservation.status === 'checked_in' && (
            <Button
              w="100%"
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              onClick={handleNavigateToBilling}
              boxShadow={`0 2px 8px ${colors.gold}50`}
            >
              Realizar Check-out
            </Button>
          )}

          {/* Solicitudes especiales y notas */}
          {(reservation.specialRequests || reservation.notes) && (
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información Adicional
              </Text>
              <Stack gap={3}>
                {reservation.specialRequests && (
                  <Box>
                    <Text fontSize="sm" color={colors.subtext} mb={1}>Solicitudes Especiales:</Text>
                    <Box
                      bg={colors.bg}
                      p={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={colors.border}
                    >
                      <Text fontSize="sm" color={colors.text} lineHeight="1.6">
                        {reservation.specialRequests}
                      </Text>
                    </Box>
                  </Box>
                )}
                {reservation.notes && (
                  <Box>
                    <Text fontSize="sm" color={colors.subtext} mb={1}>Notas:</Text>
                    <Box
                      bg={colors.bg}
                      p={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={colors.border}
                    >
                      <Text fontSize="sm" color={colors.text} lineHeight="1.6">
                        {reservation.notes}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Botón de cierre */}
          <Flex justify="flex-end" mt={4}>
            <Button
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              onClick={onClose}
              boxShadow={`0 2px 8px ${colors.gold}50`}
            >
              Cerrar
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

