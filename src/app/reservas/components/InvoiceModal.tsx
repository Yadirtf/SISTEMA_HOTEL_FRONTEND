"use client";

import { Box, Button, Flex, Stack, Text, Heading } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import type { BillingDetails as BillingDetailsType } from "../services/billing";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingDetails: BillingDetailsType | null;
}

export function InvoiceModal({ isOpen, onClose, billingDetails }: InvoiceModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen || !billingDetails) return null;

  const { reservation, pendingSales, pendingSalesTotal, totalToPay } = billingDetails;
  const guest = typeof reservation.guest === 'object' ? reservation.guest : null;
  const room = typeof reservation.room === 'object' ? reservation.room : null;

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
        maxW="800px"
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
            Factura
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

        {/* Contenido de la factura */}
        <Stack gap={6} p={6}>
          {/* Información del hotel */}
          <Box textAlign="center" pb={4} borderBottom="2px solid" borderColor={colors.border}>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold} mb={2}>
              HOTEL
            </Text>
            <Text fontSize="sm" color={colors.subtext}>
              Factura de Reserva
            </Text>
          </Box>

          {/* Información del huésped */}
          {guest && (
            <Box>
              <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3}>
                Cliente
              </Text>
              <Stack gap={1}>
                <Text fontSize="sm" color={colors.text}>
                  <Text as="span" fontWeight="bold">Nombre:</Text> {guest.firstName} {guest.lastName}
                </Text>
                <Text fontSize="sm" color={colors.text}>
                  <Text as="span" fontWeight="bold">Documento:</Text> {guest.documentNumber}
                </Text>
                {guest.phoneNumber && (
                  <Text fontSize="sm" color={colors.text}>
                    <Text as="span" fontWeight="bold">Teléfono:</Text> {guest.phoneNumber}
                  </Text>
                )}
              </Stack>
            </Box>
          )}

          {/* Detalles de la reserva */}
          <Box>
            <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3}>
              Detalles de la Reserva
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
                  {reservation.numberOfGuests || 1}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Productos fiados */}
          {pendingSales.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3}>
                Productos Fiados
              </Text>
              <Box
                bg={colors.bg}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colors.border}
              >
                <Stack gap={3}>
                  {pendingSales.map((sale) => (
                    <Box key={sale._id} pb={3} borderBottom="1px solid" borderColor={colors.border}>
                      <Text fontSize="xs" color={colors.subtext} mb={2}>
                        {new Date(sale.saleDate).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {sale.items.map((item, idx) => (
                        <Flex key={idx} justify="space-between" fontSize="sm" color={colors.text} mb={1}>
                          <Text>
                            {item.productName} x{item.quantity}
                          </Text>
                          <Text fontWeight="semibold">
                            ${formatPrice(item.subtotal)}
                          </Text>
                        </Flex>
                      ))}
                      <Flex justify="space-between" mt={2} pt={2} borderTop="1px solid" borderColor={colors.border}>
                        <Text fontSize="sm" fontWeight="bold" color={colors.text}>Subtotal:</Text>
                        <Text fontSize="sm" fontWeight="bold" color={colors.gold}>
                          ${formatPrice(sale.total)}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          {/* Desglose de pagos */}
          <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.border}>
            <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3}>
              Desglose de Pagos
            </Text>
            <Stack gap={2}>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.subtext}>Precio Habitación:</Text>
                <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                  ${formatPrice(reservation.roomPrice || 0)}
                </Text>
              </Flex>
              {pendingSalesTotal > 0 && (
                <Flex justify="space-between">
                  <Text fontSize="sm" color={colors.subtext}>Productos Fiados:</Text>
                  <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                    ${formatPrice(pendingSalesTotal)}
                  </Text>
                </Flex>
              )}
              <Flex justify="space-between" pt={2} borderTop="2px solid" borderColor={colors.border}>
                <Text fontSize="lg" color={colors.text} fontWeight="bold">Total a Pagar:</Text>
                <Text fontSize="xl" color={colors.gold} fontWeight="bold">
                  ${formatPrice(totalToPay)}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Botones */}
          <Flex gap={3} justify="flex-end" pt={4} borderTop="2px solid" borderColor={colors.border}>
            <Button
              variant="ghost"
              onClick={onClose}
              color={colors.subtext}
              _hover={{ bg: colors.surface, color: colors.text }}
            >
              Cerrar
            </Button>
            <Button
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f" }}
              onClick={() => {
                // Aquí se puede implementar la generación de PDF
                window.print();
              }}
            >
              Imprimir / Guardar PDF
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

