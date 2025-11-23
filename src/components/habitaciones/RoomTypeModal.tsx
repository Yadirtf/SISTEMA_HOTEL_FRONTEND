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

export type RoomTypeFormData = {
  tipo: string;
  descripcion: string;
};

interface RoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: RoomTypeFormData;
  onFormChange: (field: keyof RoomTypeFormData, value: any) => void;
  isLoading?: boolean;
}

export function RoomTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: RoomTypeModalProps) {
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
        maxW="500px"
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
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            {isEditing ? "Editar Tipo de Habitación" : "Crear Tipo de Habitación"}
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

        {/* Form */}
        <Box p={{ base: 4, md: 6 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Stack gap={5}>
              {/* Tipo */}
              <Box>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Nombre del Tipo *
                </Text>
                <Input
                  value={formData.tipo}
                  onChange={(e) => onFormChange("tipo", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: Individual, Doble, Suite"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  required
                />
              </Box>

              {/* Descripción */}
              <Box>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Descripción
                </Text>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => onFormChange("descripcion", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: Habitación individual con cama matrimonial"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  rows={4}
                />
              </Box>

              {/* Buttons */}
              <Flex gap={3} justify="flex-end" pt={4}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  borderColor={colors.border}
                  color={colors.subtext}
                  _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
                  transition="all 0.2s"
                >
                  <Flex align="center" gap={2}>
                    <Icon as={FiXCircle} />
                    <Text>Cancelar</Text>
                  </Flex>
                </Button>
                <Button
                  type="submit"
                  bg={colors.gold}
                  color={colors.bg}
                  disabled={isLoading || !formData.tipo.trim()}
                  _hover={{ 
                    bg: "#b8941f",
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${colors.gold}40`
                  }}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                  transition="all 0.2s"
                  fontWeight="bold"
                  boxShadow={`0 2px 8px ${colors.gold}50`}
                >
                  <Flex align="center" gap={2}>
                    <Icon as={FiCheckCircle} />
                    <Text>{isLoading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Text>
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

