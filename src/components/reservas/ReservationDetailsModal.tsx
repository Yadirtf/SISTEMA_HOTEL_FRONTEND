"use client";

import { Box, Button, Flex, Stack, Text, Heading, Badge, Spinner } from "@chakra-ui/react";
import { formatPrice } from "@/lib/format";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useState, useEffect } from "react";
import { getPendingSalesByReservation } from "@/services/sales";
import { checkOutReservation, type CheckOutData } from "@/services/reservations";
import { getToken } from "@/lib/session";
import type { Sale } from "@/app/tienda/types";
import { getPaymentMethods, type PaymentMethod } from "@/services/payment-methods";

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
}: ReservationDetailsModalProps) {
  const { colors } = useThemeMode();
  const [pendingSales, setPendingSales] = useState<Sale[]>([]);
  const [loadingPendingSales, setLoadingPendingSales] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<string>('0');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Cargar productos fiados cuando se abre el modal
  useEffect(() => {
    if (isOpen && reservation && reservation.status === 'checked_in' && reservation._id) {
      loadPendingSales();
    } else {
      setPendingSales([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reservation?._id, reservation?.status]);

  // Cargar métodos de pago
  useEffect(() => {
    const loadPaymentMethods = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const resp = await getPaymentMethods(false, token);
        if (resp.success && resp.data) {
          setPaymentMethods(resp.data);
        }
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      }
    };
    
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

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

  const handleCheckout = async () => {
    if (!reservation?._id) return;
    const token = getToken();
    if (!token) return;

    setIsCheckingOut(true);
    try {
      const checkoutData: CheckOutData = {
        paymentMethodId: paymentMethodId || undefined,
        additionalCharges: parseFloat(additionalCharges) || 0,
        notes: checkoutNotes.trim() || undefined,
      };

      const resp = await checkOutReservation(reservation._id, checkoutData, token);
      if (resp.success) {
        if (onCheckoutSuccess) {
          onCheckoutSuccess();
        }
        onClose();
      } else {
        alert(resp.message || 'Error al realizar el checkout');
      }
    } catch (error: any) {
      alert(error.message || 'Error inesperado al realizar el checkout');
    } finally {
      setIsCheckingOut(false);
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
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
                                  hour: '2-digit',
                                  minute: '2-digit',
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

          {/* Formulario de checkout (solo si está checked_in) */}
          {reservation.status === 'checked_in' && (
            <Box>
              {!showCheckoutForm ? (
                <Button
                  w="100%"
                  bg={colors.gold}
                  color={colors.bg}
                  fontWeight="bold"
                  _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
                  onClick={() => setShowCheckoutForm(true)}
                  boxShadow={`0 2px 8px ${colors.gold}50`}
                >
                  Realizar Check-out
                </Button>
              ) : (
                <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.border}>
                  <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3}>
                    Proceso de Check-out
                  </Text>
                  <Stack gap={3}>
                    {pendingSales.length > 0 && (
                      <Box p={3} bg={colors.surface} borderRadius="md" borderWidth="1px" borderColor={colors.gold}>
                        <Text fontSize="sm" color={colors.gold} fontWeight="semibold" mb={1}>
                          Productos fiados incluidos:
                        </Text>
                        <Text fontSize="sm" color={colors.text}>
                          {pendingSales.length} venta(s) por un total de ${formatPrice(pendingSalesTotal)}
                        </Text>
                      </Box>
                    )}
                    
                    <Box>
                      <Text fontSize="sm" color={colors.text} mb={2} fontWeight="semibold">
                        Método de Pago <Text as="span" color="red.500">*</Text>
                      </Text>
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.gold;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = colors.gold;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.boxShadow = 'none';
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
                      <Text fontSize="sm" color={colors.text} mb={2} fontWeight="semibold">
                        Cargos Adicionales
                      </Text>
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
                      <Text fontSize="sm" color={colors.text} mb={2} fontWeight="semibold">
                        Notas
                      </Text>
                      <textarea
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="Notas adicionales..."
                        rows={3}
                        style={{
                          width: '100%',
                          backgroundColor: colors.surface,
                          color: colors.text,
                          borderRadius: '6px',
                          padding: '8px 12px',
                          border: `2px solid ${colors.border}`,
                          fontSize: '14px',
                          resize: 'vertical',
                        }}
                      />
                    </Box>

                    <Flex gap={2} mt={2}>
                      <Button
                        flex={1}
                        variant="ghost"
                        color={colors.subtext}
                        onClick={() => {
                          setShowCheckoutForm(false);
                          setPaymentMethodId('');
                          setAdditionalCharges('0');
                          setCheckoutNotes('');
                        }}
                        disabled={isCheckingOut}
                      >
                        Cancelar
                      </Button>
                      <Button
                        flex={1}
                        bg={colors.gold}
                        color={colors.bg}
                        fontWeight="bold"
                        _hover={{ bg: "#b8941f" }}
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? "Procesando..." : "Confirmar Check-out"}
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              )}
            </Box>
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

