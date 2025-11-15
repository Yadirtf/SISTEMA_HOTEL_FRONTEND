"use client";

import {
  Button,
  Flex,
  Stack,
  Text,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CashRegisterStats } from "@/app/caja/types";
import { formatCurrency } from "@/lib/format";

type CashRegisterStatsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stats: CashRegisterStats | null;
  registerNumber: string;
  initialAmount: number;
};

export function CashRegisterStatsModal({
  isOpen,
  onClose,
  stats,
  registerNumber,
  initialAmount,
}: CashRegisterStatsModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen || !stats) return null;

  const expectedBalance = initialAmount + stats.totalIncome - stats.totalExpense;

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
        maxW="600px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.5)"
      >
        <Heading fontSize="xl" fontWeight="bold" color={colors.gold} mb={4}>
          Estadísticas - {registerNumber}
        </Heading>

        <Stack gap={4}>
          <Box>
            <Text color={colors.subtext} fontSize="sm" mb={1}>
              Monto Inicial
            </Text>
            <Text color={colors.text} fontSize="lg" fontWeight="semibold">
              {formatCurrency(initialAmount)}
            </Text>
          </Box>

          <Box borderTop="1px solid" borderColor={colors.border} pt={4} />

          <Box>
            <Text color={colors.subtext} fontSize="sm" mb={1}>
              Total Ingresos
            </Text>
            <Text color="green.400" fontSize="lg" fontWeight="semibold">
              +{formatCurrency(stats.totalIncome)}
            </Text>
          </Box>

          <Box>
            <Text color={colors.subtext} fontSize="sm" mb={1}>
              Total Egresos
            </Text>
            <Text color="red.400" fontSize="lg" fontWeight="semibold">
              -{formatCurrency(stats.totalExpense)}
            </Text>
          </Box>

          <Box borderTop="1px solid" borderColor={colors.border} pt={4} />

          <Box>
            <Text color={colors.subtext} fontSize="sm" mb={1}>
              Saldo Esperado
            </Text>
            <Text color={colors.gold} fontSize="xl" fontWeight="bold">
              {formatCurrency(expectedBalance)}
            </Text>
          </Box>

          <Box>
            <Text color={colors.subtext} fontSize="sm" mb={1}>
              Total Transacciones
            </Text>
            <Text color={colors.text} fontSize="lg" fontWeight="semibold">
              {stats.transactionCount}
            </Text>
          </Box>

        </Stack>

        <Flex gap={3} justify="flex-end" pt={6} borderTop="2px" borderColor={colors.border} mt={6}>
          <Button
            onClick={onClose}
            bg={colors.gold}
            color={colors.bg}
            fontWeight="bold"
            _hover={{ bg: "#b8941f" }}
          >
            Cerrar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

