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
import { FiX, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";

export type FloorFormData = {
  numero: number;
  descripcion: string;
};

interface FloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: FloorFormData;
  onFormChange: (field: keyof FloorFormData, value: any) => void;
  isLoading?: boolean;
}

export function FloorModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: FloorModalProps) {
  const { colors } = useThemeMode();
  
  if (!isOpen) return null;

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
        maxW="600px"
        maxH="90vh"
        overflowY="auto"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        {/* Header */}
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg={colors.bg}
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            {isEditing ? "Editar Piso" : "Registrar Piso"}
          </Text>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ color: colors.gold, bg: colors.surface }}
            size="sm"
            minW="auto"
            h="auto"
            p={1}
          >
            <Icon as={FiX} fontSize="xl" />
          </Button>
        </Box>

        {/* Body */}
        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={4}>
            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Número de Piso *
                </Text>
                <Input
                  type="number"
                  value={formData.numero || ""}
                  onChange={(e) => onFormChange("numero", Number(e.target.value))}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 1"
                  min="1"
                  max="20"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  required
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Descripción
                </Text>
                <Textarea
                  value={formData.descripcion || ""}
                  onChange={(e) => onFormChange("descripcion", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Descripción del piso (opcional)"
                  rows={3}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          p={{ base: 4, md: 6 }}
          borderTop="2px"
          borderColor={colors.border}
          bg={colors.bg}
          display="flex"
          justifyContent="flex-end"
          gap={3}
          flexWrap="wrap"
        >
          <Button
            onClick={onClose}
            variant="outline"
            borderColor={colors.border}
            color={colors.text}
            _hover={{ borderColor: colors.gold, color: colors.gold }}
            disabled={isLoading}
            size={{ base: "md", md: "sm" }}
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
            _hover={{ 
              bg: "#b8941f",
              transform: "translateY(-2px)",
              boxShadow: `0 4px 12px ${colors.gold}40`
            }}
            transition="all 0.2s"
            disabled={isLoading || !formData.numero}
            size={{ base: "md", md: "sm" }}
          >
            <Flex align="center" gap={2}>
              <Icon as={FiCheckCircle} />
              <Text>{isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}</Text>
            </Flex>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

