"use client";

import { Box, Button, Input, Text, Stack, Flex, IconButton } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice, formatDate } from "@/lib/format";
import { useState, useEffect } from "react";
import { getPaymentMethods, PaymentMethod } from "@/services/payment-methods";
import { getToken } from "@/lib/session";
import type { Sale, ReturnItem } from "../types";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedSaleId: string;
  selectedSale: Sale | null;
  items: ReturnItem[];
  reason: string;
  notes: string;
  refundMethodId: string;
  availableSales: Sale[];
  loadingSales: boolean;
  setSelectedSaleId: (saleId: string) => void;
  setReason: (reason: string) => void;
  setNotes: (notes: string) => void;
  setRefundMethodId: (methodId: string) => void;
  addItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  isLoading: boolean;
}

export function ReturnModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSaleId,
  selectedSale,
  items,
  reason,
  notes,
  refundMethodId,
  availableSales,
  loadingSales,
  setSelectedSaleId,
  setReason,
  setNotes,
  setRefundMethodId,
  addItem,
  removeItem,
  updateItemQuantity,
  isLoading,
}: ReturnModalProps) {
  const { colors } = useThemeMode();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Cargar métodos de pago cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingPaymentMethods(true);
    try {
      const resp = await getPaymentMethods(false, token);
      if (resp.success && resp.data) {
        setPaymentMethods(resp.data);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Establecer método de reembolso por defecto cuando se selecciona una venta
  useEffect(() => {
    if (selectedSale && selectedSale.paymentMethodId && !refundMethodId) {
      setRefundMethodId(selectedSale.paymentMethodId);
    }
  }, [selectedSale, refundMethodId]);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => {
    if (!selectedSale) return sum;
    const saleItem = selectedSale.items.find(si => si.product === item.productId);
    if (!saleItem) return sum;
    return sum + saleItem.unitPrice * item.quantity;
  }, 0);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(3px)"
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        color={colors.text}
        borderRadius="lg"
        w={{ base: "95%", md: "90%" }}
        maxW="900px"
        maxH="90vh"
        overflowY="auto"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            Procesar Devolución
          </Text>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            color={colors.subtext}
            _hover={{ bg: colors.bg, color: colors.gold }}
            minW="auto"
            w="32px"
            h="32px"
            p={0}
            fontSize="xl"
          >
            ×
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={4}>
            {/* Seleccionar venta */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                Seleccionar Venta <Text as="span" color="red.500">*</Text>
              </Text>
              <select
                value={selectedSaleId}
                onChange={(e) => setSelectedSaleId(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  border: `2px solid ${colors.border}`,
                  fontSize: '14px',
                  cursor: loadingSales ? 'wait' : 'pointer',
                  opacity: loadingSales ? 0.6 : 1,
                }}
                disabled={loadingSales || isLoading}
              >
                <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                  {loadingSales ? "Cargando ventas..." : "Seleccionar venta..."}
                </option>
                {!loadingSales && availableSales.map((sale) => (
                  <option key={sale._id} value={sale._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                    Venta #{sale._id?.substring(0, 8)} - {formatDate(sale.saleDate)} - ${formatPrice(sale.total)}
                  </option>
                ))}
              </select>
              {selectedSale && (
                <Box mt={2} p={3} bg={colors.bg} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
                  <Text fontSize="sm" color={colors.subtext}>
                    <strong>Fecha:</strong> {formatDate(selectedSale.saleDate)} | 
                    <strong> Total:</strong> ${formatPrice(selectedSale.total)} | 
                    <strong> Productos:</strong> {selectedSale.items.length}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Productos de la venta */}
            {selectedSale && (
              <Box>
                <Text mb={2} fontWeight="semibold" color={colors.text}>
                  Productos de la Venta
                </Text>
                <Box maxH="200px" overflowY="auto" borderWidth="1px" borderColor={colors.border} borderRadius="md" p={2}>
                  {selectedSale.items.map((saleItem) => {
                    const returnItem = items.find(item => item.productId === saleItem.product);
                    const returnedQuantity = returnItem ? returnItem.quantity : 0;
                    const availableQuantity = saleItem.quantity - returnedQuantity;

                    return (
                      <Flex
                        key={saleItem.product}
                        justify="space-between"
                        align="center"
                        p={2}
                        _hover={{ bg: colors.bg }}
                        borderBottom="1px solid"
                        borderColor={colors.border}
                      >
                        <Box flex={1}>
                          <Text fontWeight="bold">{saleItem.productName}</Text>
                          <Text fontSize="sm" color={colors.subtext}>
                            Vendido: {saleItem.quantity} | 
                            {returnItem && ` Devuelto: ${returnItem.quantity} |`}
                            {` Disponible: ${availableQuantity}`} | 
                            ${formatPrice(saleItem.unitPrice)} c/u
                          </Text>
                        </Box>
                        {availableQuantity > 0 && (
                          <Flex gap={2} align="center">
                            <IconButton
                              size="sm"
                              aria-label="Decrementar"
                              onClick={() => {
                                if (returnItem && returnItem.quantity > 0) {
                                  updateItemQuantity(saleItem.product, returnItem.quantity - 1);
                                }
                              }}
                              bg={colors.border}
                              color={colors.text}
                              disabled={!returnItem || returnItem.quantity <= 0}
                            >
                              -
                            </IconButton>
                            <Text minW="40px" textAlign="center" fontWeight="bold">
                              {returnItem ? returnItem.quantity : 0}
                            </Text>
                            <IconButton
                              size="sm"
                              aria-label="Incrementar"
                              onClick={() => addItem(saleItem.product, 1)}
                              bg={colors.gold}
                              color="white"
                              disabled={availableQuantity <= 0}
                            >
                              +
                            </IconButton>
                          </Flex>
                        )}
                      </Flex>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Productos seleccionados para devolver */}
            {items.length > 0 && selectedSale && (
              <Box>
                <Text fontWeight="bold" mb={2} color={colors.text}>
                  Productos a Devolver
                </Text>
                <Stack gap={2}>
                  {items.map((item) => {
                    const saleItem = selectedSale.items.find(si => si.product === item.productId);
                    if (!saleItem) return null;
                    return (
                      <Flex
                        key={item.productId}
                        justify="space-between"
                        align="center"
                        p={3}
                        bg={colors.bg}
                        borderRadius="md"
                      >
                        <Box flex={1}>
                          <Text fontWeight="bold">{saleItem.productName}</Text>
                          <Text fontSize="sm" color={colors.subtext}>
                            {item.quantity} x ${formatPrice(saleItem.unitPrice)} = ${formatPrice(saleItem.unitPrice * item.quantity)}
                          </Text>
                        </Box>
                        <IconButton
                          size="sm"
                          aria-label="Eliminar"
                          onClick={() => removeItem(item.productId)}
                          bg="red.500"
                          color="white"
                        >
                          🗑️
                        </IconButton>
                      </Flex>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Razón de devolución */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                Razón de Devolución
              </Text>
              <Input
                placeholder="Ej: Cliente cambió de opinión, producto defectuoso, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                disabled={isLoading}
              />
            </Box>

            {/* Método de Reembolso */}
            {selectedSale && items.length > 0 && (
              <Box>
                <Text mb={2} fontWeight="semibold" color={colors.text}>
                  Método de Reembolso
                </Text>
                <select
                  value={refundMethodId}
                  onChange={(e) => setRefundMethodId(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: `2px solid ${colors.border}`,
                    fontSize: '14px',
                    cursor: loadingPaymentMethods ? 'wait' : 'pointer',
                    opacity: loadingPaymentMethods ? 0.6 : 1,
                  }}
                  disabled={isLoading || loadingPaymentMethods}
                >
                  <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                    {loadingPaymentMethods ? "Cargando..." : "Seleccionar método de reembolso (opcional)"}
                  </option>
                  {!loadingPaymentMethods && paymentMethods.map((method) => (
                    <option key={method._id} value={method._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                      {method.icon ? `${method.icon} ` : ""}{method.name}
                    </option>
                  ))}
                </select>
                <Text fontSize="xs" color={colors.subtext} mt={1}>
                  {selectedSale.paymentMethodId 
                    ? `Por defecto se usará el mismo método de pago de la venta original. Puede cambiarlo si es necesario.`
                    : `Si no se especifica, se usará el método de pago de la venta original.`}
                </Text>
              </Box>
            )}

            {/* Notas */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                Notas Adicionales
              </Text>
              <Input
                placeholder="Notas adicionales sobre la devolución..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                disabled={isLoading}
              />
            </Box>

            {/* Total */}
            {items.length > 0 && (
              <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor="red.500">
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="bold" color={colors.text}>Total a Reembolsar:</Text>
                  <Text fontWeight="bold" fontSize="xl" color="red.500">-${formatPrice(total)}</Text>
                </Flex>
                {refundMethodId && (
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Método: {paymentMethods.find(m => m._id === refundMethodId)?.name || "No especificado"}
                  </Text>
                )}
                <Text fontSize="xs" color={colors.subtext}>
                  Este monto se restará de la caja según el método de reembolso seleccionado
                </Text>
              </Box>
            )}

            {/* Botones */}
            <Flex gap={3} justify="flex-end">
              <Button onClick={onClose} variant="ghost" color={colors.subtext} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                disabled={isLoading || !selectedSaleId || items.length === 0}
              >
                {isLoading ? "Procesando..." : "Procesar Devolución"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

