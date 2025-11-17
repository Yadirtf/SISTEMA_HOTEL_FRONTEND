"use client";

import { Box, Button, Input, Text, Stack, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice, formatNumberInput, parseFormattedNumber } from "@/lib/format";
import { useState, useEffect } from "react";
import { getPaymentMethods, getPaymentTypes, PaymentMethod, PaymentType } from "@/services/payment-methods";
import { getToken } from "@/lib/session";

// Hook para detectar tamaño de pantalla
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountReceived: number, paymentMethodId?: string, paymentTypeId?: string, cashChange?: number) => void;
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
  const isMobile = useIsMobile();
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [change, setChange] = useState<number>(0);
  const [cashChange, setCashChange] = useState<string>(""); // Cambio en efectivo a dar
  const [error, setError] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loadingPaymentData, setLoadingPaymentData] = useState(false);
  
  // Detectar si el método de pago seleccionado es efectivo
  const selectedPaymentMethod = paymentMethods.find(m => m._id === paymentMethodId);
  const isCashPayment = selectedPaymentMethod?.name?.toLowerCase().includes('efectivo') || 
                        selectedPaymentMethod?.name?.toLowerCase().includes('cash');

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

  // Calcular el cambio en efectivo cuando cambia el monto recibido o el método de pago
  useEffect(() => {
    if (amountReceived === "" || !paymentMethodId) {
      setChange(0);
      setCashChange("");
      setError("");
      return;
    }

    const amount = parseFormattedNumber(amountReceived);
    
    if (isNaN(amount) || amount === 0) {
      setChange(0);
      setCashChange("");
      setError("");
      return;
    }

    if (amount < 0) {
      setError("El monto no puede ser negativo");
      setChange(0);
      setCashChange("");
      return;
    }

    if (amount < total) {
      setError(`El monto recibido ($${formatPrice(amount)}) es menor que el total ($${formatPrice(total)})`);
      setChange(0);
      setCashChange("");
      return;
    }

    setError("");
    const calculatedChange = amount - total;
    setChange(calculatedChange);
    
    // Si el método de pago NO es efectivo y hay cambio, establecer cashChange por defecto
    if (!isCashPayment && calculatedChange > 0) {
      setCashChange(formatNumberInput(calculatedChange.toString()));
    } else {
      setCashChange("");
    }
  }, [amountReceived, total, paymentMethodId, isCashPayment]);
  
  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAmountReceived("");
      setChange(0);
      setCashChange("");
      setError("");
      setPaymentMethodId("");
      setPaymentTypeId("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const amount = parseFormattedNumber(amountReceived);
    
    if (isNaN(amount) || amount < total) {
      setError("Por favor ingresa un monto válido mayor o igual al total");
      return;
    }

    if (!paymentMethodId) {
      setError("Debes seleccionar un método de pago");
      return;
    }

    // Si el método NO es efectivo y hay cambio, validar cashChange
    let cashChangeValue: number | undefined = undefined;
    if (!isCashPayment && change > 0) {
      const cashChangeNum = parseFormattedNumber(cashChange);
      if (isNaN(cashChangeNum) || cashChangeNum < 0) {
        setError("El cambio en efectivo debe ser un número válido mayor o igual a 0");
        return;
      }
      if (cashChangeNum > change) {
        setError(`El cambio en efectivo ($${formatPrice(cashChangeNum)}) no puede ser mayor que el cambio total ($${formatPrice(change)})`);
        return;
      }
      cashChangeValue = cashChangeNum;
    }

    onConfirm(amount, paymentMethodId || undefined, paymentTypeId || undefined, cashChangeValue);
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
        w={{ base: "95%", md: "700px", lg: "800px" }}
        maxW={{ base: "95%", md: "700px", lg: "800px" }}
        maxH={{ base: "95vh", md: "90vh" }}
        h={{ base: "90vh", md: "85vh" }}
        display="flex"
        flexDirection="column"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
        position="relative"
      >
        {/* Header fijo */}
        <Box
          p={{ base: 3, md: 5 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexShrink={0}
        >
          <Text fontSize={{ base: "lg", md: "xl", lg: "2xl" }} fontWeight="bold" color={colors.gold}>
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

        {/* Contenido con scroll */}
        <Box 
          p={{ base: 3, md: 6 }}
          overflowY="auto"
          overflowX="hidden"
          flex="1 1 0"
          minH={0}
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: colors.bg,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.border,
              borderRadius: '4px',
              '&:hover': {
                background: colors.gold,
              },
            },
          }}
        >
          <Stack gap={{ base: 3, md: 5 }}>
            {/* Total a pagar */}
            <Box p={{ base: 3, md: 5 }} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.gold}>
              <Text fontSize={{ base: "sm", md: "md" }} color={colors.subtext} mb={{ base: 1, md: 2 }}>
                Total a pagar:
              </Text>
              <Text fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} fontWeight="bold" color={colors.gold}>
                ${formatPrice(total)}
              </Text>
            </Box>

            {/* Método de Pago */}
            <Box>
              <Text mb={{ base: 2, md: 3 }} fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={colors.text}>
                Método de Pago <Text as="span" color="red.500">*</Text>
              </Text>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                disabled={isLoading || loadingPaymentData}
                style={{
                  width: '100%',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderRadius: '8px',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  paddingRight: '2.5rem',
                  border: `2px solid ${error && !paymentMethodId ? 'red' : colors.border}`,
                  fontSize: isMobile ? '15px' : '16px',
                  cursor: isLoading || loadingPaymentData ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  opacity: isLoading || loadingPaymentData ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !loadingPaymentData) {
                    e.currentTarget.style.borderColor = colors.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !loadingPaymentData) {
                    e.currentTarget.style.borderColor = error && !paymentMethodId ? 'red' : colors.border;
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.gold}40`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error && !paymentMethodId ? 'red' : colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <Text mb={{ base: 2, md: 3 }} fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={colors.text}>
                Tipo de Pago
              </Text>
              <select
                value={paymentTypeId}
                onChange={(e) => setPaymentTypeId(e.target.value)}
                disabled={isLoading || loadingPaymentData}
                style={{
                  width: '100%',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderRadius: '8px',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  paddingRight: '2.5rem',
                  border: `2px solid ${colors.border}`,
                  fontSize: isMobile ? '15px' : '16px',
                  cursor: isLoading || loadingPaymentData ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  opacity: isLoading || loadingPaymentData ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !loadingPaymentData) {
                    e.currentTarget.style.borderColor = colors.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !loadingPaymentData) {
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.gold}40`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <Text mb={{ base: 2, md: 3 }} fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={colors.text}>
                Monto recibido:
              </Text>
              <Input
                type="text"
                placeholder="0"
                value={amountReceived}
                onChange={(e) => {
                  const formatted = formatNumberInput(e.target.value);
                  setAmountReceived(formatted);
                }}
                onKeyPress={handleKeyPress}
                bg={colors.bg}
                borderColor={error ? "red.500" : colors.border}
                borderWidth="2px"
                color={colors.text}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                textAlign="right"
                p={{ base: 3, md: 4 }}
                h="auto"
                disabled={isLoading}
                autoFocus
                _hover={{
                  borderColor: error ? "red.500" : colors.gold,
                }}
                _focus={{
                  borderColor: error ? "red.500" : colors.gold,
                  boxShadow: `0 0 0 2px ${error ? 'red' : colors.gold}40`,
                }}
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
                p={{ base: 3, md: 4 }}
                bg={change > 0 ? "green.50" : colors.bg}
                borderRadius="md"
                borderWidth="2px"
                borderColor={change > 0 ? "green.300" : colors.border}
                flexShrink={0}
              >
                <Text fontSize={{ base: "sm", md: "md" }} color={colors.subtext} mb={{ base: 1, md: 2 }}>
                  Cambio a devolver:
                </Text>
                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  fontWeight="bold"
                  color={change > 0 ? "green.600" : colors.gold}
                >
                  ${formatPrice(change)}
                </Text>
              </Box>
            )}

            {/* Campo para cambio en efectivo (solo cuando método NO es efectivo y hay cambio) */}
            {!isCashPayment && change > 0 && amountReceived !== "" && !error && (
              <Box>
                <Text mb={{ base: 2, md: 3 }} fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={colors.text}>
                  Cambio en Efectivo a Dar <Text as="span" color="red.500">*</Text>
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={colors.subtext} mb={{ base: 2, md: 3 }} fontStyle="italic">
                  Ingrese el monto en efectivo que dará al cliente como cambio. 
                  Este monto se descontará de la caja física.
                </Text>
                <Input
                  type="text"
                  placeholder="0"
                  value={cashChange}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value);
                    setCashChange(formatted);
                  }}
                  bg={colors.bg}
                  borderColor={error && !cashChange ? "red.500" : colors.border}
                  borderWidth="2px"
                  color={colors.text}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  textAlign="right"
                  p={{ base: 3, md: 4 }}
                  h="auto"
                  disabled={isLoading}
                  _hover={{
                    borderColor: error && !cashChange ? "red.500" : colors.gold,
                  }}
                  _focus={{
                    borderColor: error && !cashChange ? "red.500" : colors.gold,
                    boxShadow: `0 0 0 2px ${error && !cashChange ? 'red' : colors.gold}40`,
                  }}
                />
                {cashChange && !isNaN(parseFormattedNumber(cashChange)) && (
                  <Text fontSize="xs" color={colors.subtext} mt={1}>
                    Máximo: ${formatPrice(change)}
                  </Text>
                )}
              </Box>
            )}

          </Stack>
        </Box>

        {/* Botones fijos en la parte inferior */}
        <Box
          p={{ base: 3, md: 5 }}
          borderTop="2px"
          borderColor={colors.border}
          bg={colors.surface}
          flexShrink={0}
        >
          <Flex gap={{ base: 2, md: 4 }} justify="flex-end" flexWrap="wrap">
            <Button
              onClick={onClose}
              variant="ghost"
              color={colors.subtext}
              disabled={isLoading}
              minW={{ base: "90px", md: "140px" }}
              h={{ base: "38px", md: "44px" }}
              fontSize={{ base: "sm", md: "md" }}
              _hover={{ bg: colors.bg, color: colors.gold }}
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
                !amountReceived ||
                parseFormattedNumber(amountReceived) < total ||
                !paymentMethodId ||
                (!isCashPayment && change > 0 && (!cashChange || isNaN(parseFormattedNumber(cashChange)) || parseFormattedNumber(cashChange) < 0))
              }
              minW={{ base: "140px", md: "200px" }}
              h={{ base: "38px", md: "44px" }}
              fontSize={{ base: "xs", md: "md" }}
              fontWeight="bold"
            >
              {isLoading ? "Registrando..." : "Confirmar y Registrar Venta"}
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

