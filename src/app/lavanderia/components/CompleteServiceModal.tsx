"use client";

import { useState, useEffect } from "react";
import { Box, Button, Text, Stack, Flex, Icon } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getToken } from "@/lib/session";
import { getPaymentMethods } from "@/services/payment-methods";
import type { CompleteLaundryServiceFormData, PaymentMethod } from "../types";

interface CompleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: CompleteLaundryServiceFormData;
  onFormChange: (field: keyof CompleteLaundryServiceFormData, value: any) => void;
  isLoading: boolean;
  totalAmount: number;
}

export function CompleteServiceModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  isLoading,
  totalAmount,
}: CompleteServiceModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadPaymentMethods = async () => {
        setLoadingPaymentMethods(true);
        try {
          const resp = await getPaymentMethods(false, token);
          if (resp.success && resp.data) {
            setPaymentMethods(resp.data);
          }
        } catch (error) {
          console.error("Error al cargar métodos de pago:", error);
        } finally {
          setLoadingPaymentMethods(false);
        }
      };
      loadPaymentMethods();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
            Completar y Pagar Servicio
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
          >
            <Icon as={FiX} fontSize="xl" />
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <form onSubmit={handleSubmit}>
            <Stack gap={5}>
              <Box
                p={4}
                bg={colors.bg}
                borderRadius="md"
                border="2px solid"
                borderColor={colors.gold}
              >
                <Flex justify="space-between" align="center">
                  <Text color={colors.text} fontWeight="bold" fontSize="lg">
                    Total a Pagar:
                  </Text>
                  <Text color={colors.gold} fontWeight="bold" fontSize="xl">
                    ${totalAmount.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Método de Pago <Text as="span" color="red.500">*</Text>
                </Text>
                <select
                  value={formData.paymentMethodId}
                  onChange={(e) => onFormChange("paymentMethodId", e.target.value)}
                  disabled={loadingPaymentMethods}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: `2px solid ${colors.border}`,
                    fontSize: '14px',
                    cursor: loadingPaymentMethods ? 'wait' : 'pointer',
                    opacity: loadingPaymentMethods ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingPaymentMethods) {
                      e.currentTarget.style.borderColor = colors.gold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  onFocus={(e) => {
                    if (!loadingPaymentMethods) {
                      e.currentTarget.style.borderColor = colors.gold;
                      e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                    {loadingPaymentMethods ? "Cargando..." : "Seleccionar método de pago"}
                  </option>
                  {paymentMethods
                    .filter(method => method.isActive)
                    .map((method) => (
                      <option
                        key={method._id}
                        value={method._id}
                        style={{ backgroundColor: colors.surface, color: colors.text }}
                      >
                        {method.name}
                      </option>
                    ))}
                </select>
              </Box>

              <Flex gap={3} justify="flex-end" pt={2}>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  color={colors.subtext}
                  _hover={{ bg: colors.bg, color: colors.text }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  isLoading={isLoading}
                  loadingText="Procesando..."
                >
                  Completar y Pagar
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

