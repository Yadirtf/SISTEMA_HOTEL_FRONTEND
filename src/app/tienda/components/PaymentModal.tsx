"use client";

import { Box, Button, Input, Text, Stack, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useState, useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountReceived: number) => void;
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
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [change, setChange] = useState<number>(0);
  const [error, setError] = useState<string>("");

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
      setError(`El monto recibido ($${amount.toLocaleString()}) es menor que el total ($${total.toLocaleString()})`);
      setChange(0);
      return;
    }

    setError("");
    setChange(amount - total);
  }, [amountReceived, total]);

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAmountReceived("");
      setChange(0);
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const amount = parseFloat(amountReceived);
    
    if (isNaN(amount) || amount < total) {
      setError("Por favor ingresa un monto válido mayor o igual al total");
      return;
    }

    onConfirm(amount);
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
                ${total.toLocaleString()}
              </Text>
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
                  ${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  !!error || 
                  change < 0 || 
                  amountReceived === "" || 
                  isNaN(parseFloat(amountReceived)) ||
                  parseFloat(amountReceived) < total
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

