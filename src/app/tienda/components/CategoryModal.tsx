"use client";

import { Box, Button, Input, Textarea, Text, Stack, Flex, Icon } from "@chakra-ui/react";
import { FiX, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import type { CategoryFormData } from "../types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: CategoryFormData;
  onFormChange: (field: keyof CategoryFormData, value: any) => void;
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
        maxH="90vh"
        overflowY="auto"
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
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Descripción
                </Text>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => onFormChange("description", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  rows={3}
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Color
                </Text>
                <Input
                  type="color"
                  value={formData.color || "#000000"}
                  onChange={(e) => onFormChange("color", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  w="100px"
                  h="40px"
                  cursor="pointer"
                />
              </Box>

              <Flex gap={3} justify="flex-end">
                <Button onClick={onClose} variant="ghost" color={colors.subtext}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiXCircle} />
                    <Text>Cancelar</Text>
                  </Flex>
                </Button>
                <Button
                  type="submit"
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  disabled={isLoading}
                >
                  <Flex align="center" gap={2}>
                    <Icon as={FiCheckCircle} />
                    <Text>{isLoading ? "Cargando..." : isEditing ? "Actualizar" : "Crear"}</Text>
                  </Flex>
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

