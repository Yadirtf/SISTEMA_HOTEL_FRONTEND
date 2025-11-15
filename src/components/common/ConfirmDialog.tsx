"use client";

import {
  Button,
  Flex,
  Text,
  Box,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "info",
}: ConfirmDialogProps) {
  const { colors } = useThemeMode();

  if (!isOpen) return null;

  const variantColors = {
    danger: { bg: "red.500", hover: "red.600" },
    warning: { bg: "orange.500", hover: "orange.600" },
    info: { bg: colors.gold, hover: "#b8941f" },
  };

  const currentVariant = variantColors[variant];

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={2000}
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
        <Text fontSize="xl" fontWeight="bold" color={colors.gold} mb={2}>
          {title}
        </Text>
        <Text color={colors.text} mb={6}>
          {message}
        </Text>
        <Flex gap={3} justify="flex-end">
          <Button
            onClick={onCancel}
            bg={colors.border}
            color={colors.text}
            _hover={{ bg: colors.subtext }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            bg={currentVariant.bg}
            color="white"
            fontWeight="bold"
            _hover={{ bg: currentVariant.hover }}
          >
            {confirmText}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

