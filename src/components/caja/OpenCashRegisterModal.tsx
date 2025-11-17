"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Textarea,
  Text,
  Box,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatNumberInput, parseFormattedNumber } from "@/lib/format";
import { useState } from "react";

interface OpenCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (initialAmount: number, notes?: string) => void;
}

export function OpenCashRegisterModal({
  isOpen,
  onClose,
  onSubmit,
}: OpenCashRegisterModalProps) {
  const { colors } = useThemeMode();
  const [initialAmount, setInitialAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const amount = parseFormattedNumber(initialAmount);
    if (!amount || amount <= 0) {
      alert("El monto inicial debe ser mayor a 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount, notes || undefined);
      setInitialAmount("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
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
        <Text fontSize="xl" fontWeight="bold" color={colors.gold} mb={4}>
          Abrir Caja
        </Text>

        <Stack gap={4}>
          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Monto Inicial *
            </Text>
            <Input
              type="text"
              value={initialAmount}
              onChange={(e) => {
                const formatted = formatNumberInput(e.target.value);
                setInitialAmount(formatted);
              }}
              placeholder="0"
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isSubmitting}
            />
          </Box>

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Notas (Opcional)
            </Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isSubmitting}
              rows={3}
            />
          </Box>

          <Flex gap={3} justify="flex-end" pt={4} borderTop="2px" borderColor={colors.border}>
            <Button
              onClick={onClose}
              bg={colors.border}
              color={colors.text}
              _hover={{ bg: colors.subtext }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Abriendo..." : "Abrir Caja"}
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

