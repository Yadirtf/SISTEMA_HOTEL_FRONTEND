"use client";

import {
  Box,
  Button,
  Input,
  Text,
  Stack,
  Flex,
  Textarea,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatCurrency } from "@/lib/format";
import type { CashTransactionFormData } from "@/app/caja/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: Partial<CashTransactionFormData>;
  onFormChange: (field: keyof CashTransactionFormData, value: any) => void;
  isLoading: boolean;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  isLoading,
}: ExpenseModalProps) {
  const { colors } = useThemeMode();

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
      p={4}
    >
      <Box
        bg={colors.surface}
        color={colors.text}
        borderRadius="lg"
        w={{ base: "95%", md: "500px" }}
        maxW="500px"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
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
            Registrar Egreso
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

        <form onSubmit={handleSubmit}>
          <Box p={{ base: 4, md: 6 }}>
            <Stack gap={4}>
              <Box>
                <Text fontSize="sm" color={colors.subtext} mb={2}>
                  Descripción <Text as="span" color="red.400">*</Text>
                </Text>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => onFormChange("description", e.target.value)}
                  placeholder="Ej: Pago de energía eléctrica, Compra de botellones de agua..."
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  required
                  disabled={isLoading}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color={colors.subtext} mb={2}>
                  Monto <Text as="span" color="red.400">*</Text>
                </Text>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ""}
                  onChange={(e) => onFormChange("amount", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  required
                  disabled={isLoading}
                />
                {formData.amount && formData.amount > 0 && (
                  <Text fontSize="xs" color={colors.subtext} mt={1}>
                    {formatCurrency(formData.amount)}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" color={colors.subtext} mb={2}>
                  Notas (Opcional)
                </Text>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => onFormChange("notes", e.target.value)}
                  placeholder="Información adicional sobre este egreso..."
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  rows={3}
                  disabled={isLoading}
                />
              </Box>
            </Stack>
          </Box>

          <Flex
            gap={3}
            p={{ base: 4, md: 6 }}
            borderTop="2px"
            borderColor={colors.border}
            justify="flex-end"
          >
            <Button
              onClick={onClose}
              variant="ghost"
              color={colors.subtext}
              _hover={{ bg: colors.bg, color: colors.text }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f" }}
              isLoading={isLoading}
              loadingText="Registrando..."
              disabled={isLoading}
            >
              Registrar Egreso
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}

