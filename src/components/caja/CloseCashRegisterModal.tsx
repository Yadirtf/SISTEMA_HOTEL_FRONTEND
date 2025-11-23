"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Textarea,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FiXCircle, FiLock } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatNumberInput, parseFormattedNumber } from "@/lib/format";
import type { CloseCashRegisterFormData } from "@/app/caja/types";

interface CloseCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: CloseCashRegisterFormData;
  onFormChange: (field: keyof CloseCashRegisterFormData, value: any) => void;
  isLoading?: boolean;
  expectedBalance?: number;
}

export function CloseCashRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  isLoading = false,
  expectedBalance,
}: CloseCashRegisterModalProps) {
  const { colors } = useThemeMode();
  
  if (!isOpen) return null;

  const difference = expectedBalance !== undefined && formData.actualBalance
    ? formData.actualBalance - expectedBalance
    : 0;

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
    >
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={6}
        maxW="500px"
        w="100%"
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.5)"
      >
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold} mb={4}>
          Cerrar Caja
        </Text>

        <Stack gap={4}>
          {expectedBalance !== undefined && (
            <Box
              bg={colors.bg}
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor={colors.border}
            >
              <Text fontSize="sm" color={colors.subtext} mb={1}>
                Saldo Esperado:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color={colors.gold}>
                ${expectedBalance.toFixed(2)}
              </Text>
            </Box>
          )}

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Saldo Físico Contado *
            </Text>
            <Input
              type="text"
              value={formData.actualBalance ? formatNumberInput(formData.actualBalance.toString()) : ""}
              onChange={(e) => {
                const formatted = formatNumberInput(e.target.value);
                const parsed = parseFormattedNumber(formatted);
                onFormChange("actualBalance", parsed);
              }}
              placeholder="0"
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isLoading}
            />
          </Box>

          {expectedBalance !== undefined && formData.actualBalance > 0 && (
            <Box
              bg={difference >= 0 ? "green.900" : "red.900"}
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor={difference >= 0 ? "green.500" : "red.500"}
            >
              <Text fontSize="sm" color={colors.subtext} mb={1}>
                Diferencia:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color={difference >= 0 ? "green.300" : "red.300"}>
                {difference >= 0 ? "+" : ""}${Math.abs(difference).toFixed(2)}
              </Text>
            </Box>
          )}

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Notas de Cierre
            </Text>
            <Textarea
              value={formData.closingNotes || ""}
              onChange={(e) => onFormChange("closingNotes", e.target.value)}
              placeholder="Notas sobre el cierre de caja..."
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isLoading}
              rows={3}
            />
          </Box>

          <Flex gap={3} justify="flex-end" pt={4} borderTop="2px" borderColor={colors.border}>
            <Button
              onClick={onClose}
              bg={colors.border}
              color={colors.text}
              _hover={{ bg: colors.subtext }}
              disabled={isLoading}
            >
              <Flex align="center" gap={2}>
                <Icon as={FiXCircle} />
                <Text>Cancelar</Text>
              </Flex>
            </Button>
            <Button
              onClick={onSubmit}
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              disabled={isLoading}
            >
              <Flex align="center" gap={2}>
                <Icon as={FiLock} />
                <Text>{isLoading ? "Cerrando..." : "Cerrar Caja"}</Text>
              </Flex>
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

