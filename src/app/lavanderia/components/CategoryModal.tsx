"use client";

import { Box, Button, Input, Text, Stack, Flex, Icon } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import type { LaundryCategoryFormData } from "../types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: LaundryCategoryFormData;
  onFormChange: (field: keyof LaundryCategoryFormData, value: any) => void;
  isLoading: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading,
}: CategoryModalProps) {
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
            {isEditing ? "Editar Categoría" : "Crear Categoría"}
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
              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Nombre <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  placeholder="Ej: Ropa Común y Corriente"
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Precio por Unidad <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => onFormChange("pricePerUnit", parseFloat(e.target.value) || 0)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  placeholder="0"
                  min="0"
                  step="100"
                  required
                />
                <Text fontSize="sm" color={colors.subtext} mt={1}>
                  Precio que se cobrará por cada prenda de esta categoría
                </Text>
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
                  loading={isLoading}
                  loadingText={isEditing ? "Actualizando..." : "Creando..."}
                >
                  {isEditing ? "Actualizar" : "Crear"}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

