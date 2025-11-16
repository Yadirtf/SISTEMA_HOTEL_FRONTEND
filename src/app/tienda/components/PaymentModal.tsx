"use client";

import { Box, Button, Input, Text, Stack, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { useState, useEffect } from "react";
import { getPaymentMethods, getPaymentTypes, PaymentMethod, PaymentType } from "@/services/payment-methods";
import { getToken } from "@/lib/session";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountReceived: number, paymentMethodId?: string, paymentTypeId?: string) => void;
  total: number;
  isLoading?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  total,
  isLoading = false,
}: PaymentModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [change, setChange] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loadingPaymentData, setLoadingPaymentData] = useState(false);

  // Calcular el cambio cuando cambia el monto recibido
  useEffect(() => {
    if (amountReceived === "") {
      setChange(0);
      setError("");
      return;
    }

    const amount = parseFloat(amountReceived);
    
    if (isNaN(amount)) {
      setChange(0);
      setError("");
      return;
    }

    if (amount < 0) {
      setError("El monto no puede ser negativo");
      setChange(0);
      return;
    }

    if (amount < total) {
      setError(`El monto recibido ($${formatPrice(amount)}) es menor que el total ($${formatPrice(total)})`);
      setChange(0);
      return;
    }

    setError("");
    setChange(amount - total);
  }, [amountReceived, total]);

  // Cargar métodos y tipos de pago cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadPaymentData();
    }
  }, [isOpen, token]);

  const loadPaymentData = async () => {
    setLoadingPaymentData(true);
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
    } finally {
      setLoadingPaymentData(false);
    }
  };

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAmountReceived("");
      setChange(0);
      setError("");
      setPaymentMethodId("");
      setPaymentTypeId("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const amount = parseFloat(amountReceived);
    
    if (isNaN(amount) || amount < total) {
      setError("Por favor ingresa un monto válido mayor o igual al total");
      return;
    }

    if (!paymentMethodId) {
      setError("Debes seleccionar un método de pago");
      return;
    }

    onConfirm(amount, paymentMethodId || undefined, paymentTypeId || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !error && change >= 0 && amountReceived !== "") {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={2000}
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
        w={{ base: "95%", md: "500px" }}
        maxW="500px"
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
            Procesar Pago
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
            disabled={isLoading}
          >
            ×
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={4}>
            {/* Total a pagar */}
            <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.border}>
              <Text fontSize="sm" color={colors.subtext} mb={1}>
                Total a pagar:
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>
                ${formatPrice(total)}
              </Text>
            </Box>

            {/* Método de Pago */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
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
                  border: `2px solid ${error && !paymentMethodId ? 'red' : colors.border}`,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
                disabled={isLoading || loadingPaymentData}
              >
                <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                  {loadingPaymentData ? "Cargando..." : "Seleccionar método de pago"}
                </option>
                {!loadingPaymentData && paymentMethods.map((method) => (
                  <option key={method._id} value={method._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                    {method.icon ? `${method.icon} ` : ""}{method.name}
                  </option>
                ))}
              </select>
            </Box>

            {/* Tipo de Pago */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                Tipo de Pago
              </Text>
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
                disabled={isLoading || loadingPaymentData}
              >
                <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                  {loadingPaymentData ? "Cargando..." : "Seleccionar tipo de pago (opcional)"}
                </option>
                {!loadingPaymentData && paymentTypes.map((type) => (
                  <option key={type._id} value={type._id} style={{ backgroundColor: colors.surface, color: colors.text }}>
                    {type.name}
                  </option>
                ))}
              </select>
            </Box>

            {/* Input para monto recibido */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                Monto recibido:
              </Text>
              <Input
                type="number"
                placeholder="0.00"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                onKeyPress={handleKeyPress}
                bg={colors.bg}
                borderColor={error ? "red.500" : colors.border}
                color={colors.text}
                fontSize="xl"
                fontWeight="bold"
                textAlign="right"
                disabled={isLoading}
                autoFocus
                min={0}
                step="0.01"
              />
              {error && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {error}
                </Text>
              )}
            </Box>

            {/* Cambio a devolver */}
            {change >= 0 && amountReceived !== "" && !error && (
              <Box
                p={4}
                bg={change > 0 ? "green.50" : colors.bg}
                borderRadius="md"
                borderWidth="2px"
                borderColor={change > 0 ? "green.300" : colors.border}
              >
                <Text fontSize="sm" color={colors.subtext} mb={1}>
                  Cambio a devolver:
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={change > 0 ? "green.600" : colors.gold}
                >
                  ${formatPrice(change)}
                </Text>
              </Box>
            )}

            {/* Botones */}
            <Flex gap={3} justify="flex-end" mt={2}>
              <Button
                onClick={onClose}
                variant="ghost"
                color={colors.subtext}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                disabled={
                  isLoading || 
                  loadingPaymentData ||
                  !!error || 
                  change < 0 || 
                  amountReceived === "" || 
                  isNaN(parseFloat(amountReceived)) ||
                  parseFloat(amountReceived) < total ||
                  !paymentMethodId
                }
              >
                {isLoading ? "Registrando..." : "Confirmar y Registrar Venta"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

